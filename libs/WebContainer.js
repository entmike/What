var exports = exports || {};
// Required Packages
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var HttpServlet = require('./HttpServlet');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');
var WebApplication = require('./WebApplication');
// 3rd Party add-ons
var formidable = require('./formidable');
require('./colors');
// Private
var httpServer = null;			// NodeJS HTTP Server
var webapps = []; 				// Web Applications
var contexts = []; 				// ServletContext Collection
var requestLog = []; 			// HTTP Request Log
/**
 * Web Container Configuration Object
 */
var config = {};				// Web Container Configuration
var status = {					// Web Container Status
	startupTime : new Date(),	// Start Time
	running : false,			// Running Flag
	counter: 0					// Hit Counter
};
try{ // Load Config
	var data = fs.readFileSync("serverConfig.js");
	config = eval("(" + data.toString() + ")");
}catch(e){
	console.log(e);
	console.log("Bad or missing serverConfig.js file.  Ending now.".red.bold);
	return;
};
/**
 * Removes App From App Collection
 * @param appName Name of Application to restart.
 * @return WebApp
 */
function removeApp(appName) {
	for(var i=0;i<webapps.length;i++) {
		if(appName.indexOf(webapps[i].getName())==0) {
			var webapp = webapps[i];
			removeContext(appName);
			webapps.splice(i,1);
			return webapp;
		}
	}
	return null;
}
/**
 * Removes and Reloads and Starts App
 * @param appName Name of Application to restart.
 */
function restartApp(appName) {
	var webapp = removeApp(appName);
	try {
		loadWebApp(appName);
	}catch(e){
		console.log(e.message.red.bold);
	}
}
/**
 * Loads Web App from sub-directory in 'webapps'.
 * @param appName Name of Application to load.
 */
function loadWebApp(appName) {
	var webJS = "webapps/" + appName + "/WEB-INF/web.js";
	try{ // Load Web Config for App
		var data = fs.readFileSync(webJS);
	}catch(e){
		throw new Error("Could not find web.js file in [" + webJS + "].");
	};
	try { // Try to eval the data into a config
		var webConfig = eval("(" + data.toString() + ")");
	}catch(e){
		throw new Error("Problem evaluating web.js");
	};
	var initObj = {
		appName : appName,
		webConfig : webConfig,
		containerServices : containerServices,
		adminServices : (config.adminApp==appName)?adminServices:null
	};
	// Is it an administration servlet, if so, allow access to WebContainer.
	if(config.adminApp == appName) {
		debug.log(("Admin Servlet [" + appName + "] Found.  Assigning Admin Services").green.bold);
	};
	var webApp = WebApplication.create(initObj); // Create Web App
	webapps.push(webApp); // Push WebApp into collection
}
/**
 * Scan Web Container's webapps folder for Applications and Load them
 */
function loadWebApps() {
	debug.log ("Scanning for webapps...".blue.bold);
	var wa = fs.readdirSync("webapps");
	for(var i=0;i<wa.length;i++) {
		try { 
			loadWebApp(wa[i]); 
			console.log(("Web App [" + wa[i] + "] loaded!").green.bold);
		}
		catch(e){ console.log(e.message.red.bold); }
	}
};
/**
 * Debug to console if debug enabled.
 */
var debug = {
	log : function(msg) { if(config.debug) 
		console.log(("[" + status.counter + "] [" + new Date().toGMTString() + "]: ").grey.bold + msg);
	}
};
/**
 * Get Contexts Collection
 * 
 * @return context Collection
 */
function getContexts() {
	return contexts;
};
/**
 * Remove Context from contexts Collection
 * @param context Context to remove
 */
function removeContext(context) {
	for(var i=0;i<contexts.length;i++) if(contexts[i].path == context) {
		contexts.splice(i,1);
	}
};
 /**
 * Add Context to Contexts Collection
 * @param context Context to add
 */
function addContext(context) {
	contexts.push(context);
};
 /**
 * Get Context from Contexts Collection
 * @param name of Context to get
 * @return context
 */
function getContext(name){
	for(var i=0;i<contexts.length;i++) if(contexts[i].path==name) return contexts[i];
};
/**
 * Get WebApp by Name
 * @param name Name of WebApp to retrieve
 * @return WebApp
 */
function getWebApp(name) {
	// Get WebApp by name
	for(var i=0;i<webapps.length;i++) {
		if(name.indexOf(webapps[i].getName())==0) return webapps[i];
	}
	return null;
};
/**
 * Get Template from filename in templates/ dir.
 * @param template Template file name
 * @return Template Contents [String]
 */
function getTemplate(template) {
	var template = fs.readFileSync("templates/" + template).toString();
	return template;
};
/**
 * Get Path Translation for path
 * @param source Requested Pathname
 * @return Translated Path, or original if no translations present.
 */
function getTranslation(source) {
	if(!config.translations) return null;
	for(var i=0;i<config.translations.length;i++) {
		var translation = config.translations[i];
		for(var j=0;j<translation.source.length;j++) if(translation.source[j] == source) {
			debug.log("Translating [" + source + "] to [" + translation.target + "].");
			return translation.target;
		}
	}
	return null;
};
/**
 * Exposes Safe Private Functions to return object
 */
var containerServices = { // Services Available to all Contexts
	getContexts : getContexts, 
	addContext : addContext,
	getContext : getContext
};
/**
 * Exposes Administrative Functions to return object
 */
var adminServices = { // Services Available to Admin Contexts
	getApplications : function() { return webapps; },
	getWebApp : getWebApp,
	getEnvironment : function() { return process.env; },
	restartApp : restartApp,		
	stopServer : function() { /*Stub*/ }
};
var listener = function(req, res) {
	if(req.method=="POST") { // Handle form fields with async formidable addon
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			var formData = {
				err : err,
				fields : fields,
				files : files
			};
			listenerCallback({
				req : req,
				res : res,
				formData : formData});
		});
	}else{ // Proceed with no post data
		listenerCallback({
			req : req,
			res : res});
	}
};
var listenerCallback = function(options) {	
	var req = options.req;
	var res = options.res;
	var formData = options.formData || {};
	req.formData = formData; // Temp
	// Get Start Time of request
	var startMS = new Date().getTime();
	// Create HttpServletRequest and HttpServletResponse objects from NodeJS ones.
	var request = new HttpServletRequest.HttpServletRequest(req);
	var response = new HttpServletResponse.HttpServletResponse(res);
	var writer = response.getWriter();
	// Node.JS listener handler
	status.counter++;		// Internal Counter
	if(req.formData) {
		// debug.log(JSON.stringify(req.formData.fields));
		if(req.formData.files) {
			//debug.log(JSON.stringify(req.formData.files));
		}
	}
	var URL = url.parse(req.url, true);
	var pathName = URL.pathname;
	var pathName = (getTranslation(pathName))?getTranslation(pathName):pathName;
	debug.log("Incoming Request : [" + pathName + "] - Method [" + req.method + "]");
	var webApp = getWebApp(pathName.substring(1));		// Trim off leading "/"
	if(webApp) {			// Web App
		debug.log("Found App: [" + webApp.getName() + "]");
		var webAppURL = pathName.substring(webApp.getName().length + 1); 	// Slice off webapp portion of URL
		webAppURL = (webApp.getTranslation(webAppURL))?(webApp.getTranslation(webAppURL)):webAppURL;
		var mapping = webApp.getMapping(webAppURL);
		if(mapping) {
			var servlet = webApp.getServlet(mapping.name);
			if(servlet) {	// Servlet Exists
				debug.log("Found Servlet: [" + servlet.getServletConfig().getServletName() + "]");
				servlet.service(request, response);
			}else{
				// Should be a servlet but there's not one.  To-do: Error message
				response.setStatus(500);
				response.setHeader("Content-Type", "text/html");
				var template = getTemplate("500.tmpl");
				template = template.replace("<@title>", "Servlet Not Found!");
				template = template.replace("<@message>", "Servlet Not Found!");
				template = template.replace("<@error>", "The requested Servlet is not running.");
				writer.write(template);
			}
		}else{	// No mapping, try a MIME from webapps/[app]/...
			var MIMEPath = "webapps/" + webApp.getName() + webAppURL;
			var forbidPath = "webapps/" + webApp.getName() + "/WEB-INF";
			if(MIMEPath.indexOf(forbidPath) == 0){ // Forbid /WEB-INF/ listing
				debug.log("Forbidding WEB-INF: [" + forbidPath + "]");
				response.setStatus(403);
				response.setHeader("Content-Type", "text/html");
				var template = getTemplate("403.tmpl");
				template = template.replace("<@message>", "WEB-INF listing is forbidden.");
				template = template.replace("<@title>", "WEB-INF listing is forbidden.");
				writer.write(template);
			}else{	// Non-forbidden, check MIMEs
				var MIME = getMIME(MIMEPath, pathName);
				if(MIME.found) {
					if(MIME.ext == "nsp") {		// NSP page
						var servlet = webApp.getServlet(MIMEPath);
						if(!servlet) {			// Initial NSP request, create servlet.
							debug.log("Creating Servlet for: [" + MIMEPath + "] from NSP...");
							var servletOptions = HttpServlet.parseNSP(MIME.content.toString());
							var options = {
								servletOptions : servletOptions,
								meta : {
									name : MIMEPath,
									description : "NSP File",
									servletClass : ".NSP"
								}
							};
							servlet = webApp.loadServlet(options);
						}
						// Call Servlet Service
						servlet.service(request, response);
					}else{// General MIME type
						response.setStatus(MIME.status);
						response.setHeader("Content-Type", MIME.mimeType.mimeType);
						writer.setStream(MIME.content);
					}
				}else{
					response.setStatus(MIME.status);
					response.setHeader("Content-Type", MIME.mimeType.mimeType);
					writer.setStream(MIME.content);
				}
			}
		}
	}else{ // Not a webapp, try a MIME from webroot
		var MIME = getMIME(config.webroot + pathName, pathName);
		response.setStatus(MIME.status);
		response.setHeader("Content-Type", MIME.mimeType.mimeType);
		if(!MIME.found) {
			/* To-do Logging 404 Logic maybe */
		}
		writer.setStream(MIME.content);
	}
	response.flushBuffer();
	// Get End Time
	var endMS = new Date().getTime();
	// Get Duration
	var duration = endMS - startMS;
	debug.log("Response complete - Status Code [" + response.getStatus().toString().green + "] - Duration [" + duration + "ms]");
};


var	MIMEinfo = function(ext) {
	// Get MIME type for extension
	ext = "." + ext;
	for(var i=0;i<config.mimeTypes.length;i++) {
		if(config.mimeTypes[i].ext == ext) return config.mimeTypes[i];
	}
	return "text/plain";
};
var getMIME = function(path, reqPath) {
	// Load MIME Resource and return as object w/some feedback
	var ext;
	var dots = path.split(".");
	if(dots.length>0) ext=(dots[dots.length-1]);
	var MIME = {};
	var data = null;
	try{
		var stats = fs.statSync(path);
		if(stats.isDirectory()) {
			if(path.substring(path.length-1)!="/") path+="/";
			if(reqPath.substring(reqPath.length-1)!="/") reqPath+="/";
			MIME.found = true;
			MIME.path = path;
			MIME.folder = true;
			if(config.allowDirectoryListing){
				MIME.status = 200;
				MIME.mimeType = MIMEinfo("html");
				var template = getTemplate("directoryListing.tmpl");
				MIME.content = template;
				var listing = "<TABLE id=\"listing\"><TR>";
				listing+="<TH>File</TH>";
				listing+="<TH>Date Modified</TH>";
				listing+="</TR>";
				var items = fs.readdirSync(path);
				for(var i = 0;i<items.length;i++){
					var item = fs.statSync(MIME.path + "/" + items[i]);
					listing+="<TR>";
					listing+="<TD><A href = \"" + reqPath + items[i] + "\">" + items[i] + "</A></TD>";
					listing+="<TD>" + item.mtime + "</TD>";
					listing+="</TR>";
				}					
				listing += "</TABLE>";
				MIME.content = MIME.content.replace("<@title>", "Directory Listing of: [" + path + "]");
				MIME.content = MIME.content.replace("<@header>", "Directory Listing of: [" + path + "]");
				MIME.content = MIME.content.replace("<@listing>", listing);
			}else{
				MIME.status = 501;
				MIME.mimeType = MIMEinfo("html");
				var template = getTemplate("directoryListing.tmpl");
				MIME.content = template;
				MIME.content = MIME.content.replace("<@message>", "Directory Listing not allowed.");
			}
		}
		if(stats.isFile()){
			debug.log("Opening file [" + path + "]");
			data = fs.readFileSync(path);
			MIME.status = 200;
			MIME.found = true;
			MIME.ext = ext;
			MIME.path = path;
			MIME.content = data;
			MIME.mimeType = MIMEinfo(ext);			
		}
	}catch(e){
		debug.log("MIME not found.");
		debug.log(e);
		MIME.found = false;
		MIME.status = 404;
		MIME.path = path;
		MIME.mimeType = MIMEinfo("html");
		var template = getTemplate("404.tmpl");
		template = template.replace("<@title>", "404 - Resource Not Found!");
		template = template.replace("<@message>", "The requested resource [" + reqPath + "] was not found.");
		MIME.content = template;
	}
	return MIME;
};
exports.create=function(){
	// Public
	return {
		toString : function() {
			return "Web Container";
		},
		start : function() {
			if(status.running) {
				console.log("Web Container already running!");
				return;
			}else{
				loadWebApps();
				status.running = true;
				status.startupTime = new Date();
				httpServer = http.createServer(listener);
				httpServer.listen(config.port);
				console.log("Web Container running on:" + config.port);
			}
		}
	};
};