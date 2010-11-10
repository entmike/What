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
var Utils = require('./Utils');
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
	return null;
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
var completeResponse = function(request, response){
	response.flushBuffer();
	// Get End Time
	var endMS = new Date().getTime();
	// Get Duration
	// var duration = endMS - startMS;
	var duration = 0;
	debug.log("Response complete - Status Code [" + response.getStatus().toString().green + "] - Duration [" + duration + "ms]");
}
var listenerCallback = function(options) {	
	// Get Node.JS Request and Response objects
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
	if(req.formData && req.formData.files) {
		// Todo: File Handling
	}
	// Get Request URL
	var URL = url.parse(req.url, true);
	var pathName = URL.pathname;
	pathName = (getTranslation(pathName))?getTranslation(pathName):pathName;
	debug.log("Incoming Request : [" + pathName + "] - Method [" + req.method + "]");
	// See if there's a WebApp
	var webApp = getWebApp(pathName.substring(1));		// Trim off leading "/"
	if(webApp) { // Web App
		debug.log("Found App: [" + webApp.getName() + "]");
		var webAppURL = pathName.substring(webApp.getName().length + 1);  // Slice off webapp portion of URL
		webAppURL = (webApp.getTranslation(webAppURL))?(webApp.getTranslation(webAppURL)):webAppURL;
		webApp.handle({
			URL : webAppURL,
			request : request,
			response : response,
			callback : completeResponse
		});
	}else{ // Not a webapp, try a MIME from webroot
		Utils.getMIME({
			path: config.webroot + pathName,
			relPath : pathName,
			modSince : request.getHeader("If-Modified-Since"),
			cacheControl : request.getHeader("Cache-Control"),
			callback: function(MIME) {
				response.setStatus(MIME.status);
				switch(MIME.status) {
					// Cache (Not Changed)
					case 304:
						response.setHeader("Content-Type", "");
					break;
					default:
						response.setHeader("Content-Type", MIME.mimeType.mimeType);
						response.setHeader("Last-Modified", MIME.modTime);
						response.getWriter().setStream(MIME.content);
				}
				completeResponse(request, response);
			}
		});
	}
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