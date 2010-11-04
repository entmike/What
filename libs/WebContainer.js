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
// 3rd Party plugins
var formidable = require('./formidable');
require('./colors');

exports.create = function() {
	/*
	===============================================
	Private Section
	===============================================
	*/
	// NodeJS HTTP Server
	var httpServer = null;
	// Web Applications
	var webapps = [];
	// ServletContext Collection
	var contexts = [];
	// HTTP Request Log
	var requestLog = [];
	// Web Container Configuration
	var config = {};
	try{
		var data = fs.readFileSync("serverConfig.js");
		config = eval("(" + data.toString() + ")");
	}catch(e){
		console.log(e);
		console.log("Bad or missing serverConfig.js file.  Ending now.");
		return;
	}
	// Web Container Status
	var status = {
		startupTime : new Date(),
		running : false,
		counter: 0
	};
	var removeApp = function(appName) {
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
	var restartApp = function(appName) {
		var webapp = removeApp(appName);
		loadWebApp(appName);
	}
	var loadWebApp = function(appName) {
		// Get 'webapps' directory contents
		var stats = fs.statSync("webapps/" + appName);
		if(stats.isDirectory()) {   // Only Directories 
			var wb = fs.readdirSync("webapps/"+appName);
			for(var j=0;j<wb.length;j++) {
				// Look for 'WEB-INF' directory
				if(wb[j]=="WEB-INF") {
					try{	// See if there's a web.js file
						// Look for 'web.js' file
						var data = fs.readFileSync("webapps/" + appName + "/WEB-INF/web.js");
						// Load Web Config for App
						var webConfig = eval("(" + fs.readFileSync("webapps/" + appName + "/WEB-INF/web.js").toString() + ")");
						var initObj = {
							appName : appName,
							webConfig : webConfig,
							containerServices : containerServices
						}
						// Is it an administration servlet, if so, allow access to WebContainer.
						if(config.adminApp == appName) {
							debug.log(("Admin Servlet [" + appName + "] Found.  Assigning Admin Services").green.bold);
							initObj.adminServices = adminServices;
						}
						// Create Web App
						var webApp = WebApplication.create(initObj);
						// Push WebApp into collection
						webapps.push(webApp);
					}catch(e){
						debug.log(e);
						// No web.js file.  Not a web app.
					}
				}
			}
		}
	}
	var loadWebApps = function() {
		/* 
		Scan Web Container's webapps folder for Applications
		*/
		debug.log ("Scanning for webapps...".blue.bold);
		var wa = fs.readdirSync("webapps");
		for(var i=0;i<wa.length;i++) loadWebApp(wa[i]);
	};
	var debug = {
		log : function(msg) { if(config.debug) 
			console.log(("[" + status.counter + "] [" + new Date().toGMTString() + "]: ").grey.bold + msg);
		}
	};
	var getContexts = function() {
		// Get all WebApp contexts
		return contexts;
	}
	var removeContext = function(cont) {
		// Remove App Context from collection
		for(var i=0;i<contexts.length;i++) {
			if(contexts[i].path == cont) {
				contexts.splice(i,1);
			}
		}
	}
	var addContext = function(cont) {
		// Add Context to collection
		contexts.push(cont);
	}
	var getContext = function(path){
		// Find context by name/path
		for(var i=0;i<contexts.length;i++) if(contexts[i].path==path) return contexts[i];
	};
	var getWebApp = function(name) {
		// Get WebApp by name
		for(var i=0;i<webapps.length;i++) {
			if(name.indexOf(webapps[i].getName())==0) return webapps[i];
		}
		return null;
	}
	var	MIMEinfo = function(ext) {
		// Get MIME type for extension
		ext = "." + ext;
		for(var i=0;i<config.mimeTypes.length;i++) {
			if(config.mimeTypes[i].ext == ext) return config.mimeTypes[i];
		}
		return "text/plain";
	}
	var getTemplate = function(template) {
		var template = fs.readFileSync("templates/" + template).toString();
		return template;
	}
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
					listing += "</TABLE>"
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
	}
	var getTranslation = function (source) {
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
	var listener = function(req, res) {
        if(req.method=="POST") {
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                req.formData = {
                    err : err,
                    fields : fields,
                    files : files
                };
                requestComplete(req, res);
            });
        }else{
            requestComplete(req, res);
        }
    };
    var requestComplete = function(req, res) {		
        // Get Start Time of request
        var startMS = new Date().getTime();
        // Create HttpServletRequest and HttpServletResponse objects from NodeJS ones.
        var request = new HttpServletRequest.HttpServletRequest(req);
		var response = new HttpServletResponse.HttpServletResponse(res);
		var writer = response.getWriter();
		// Node.JS listener handler
		status.counter++;		// Internal Counter
		if(req.formData) {
            debug.log(JSON.stringify(req.formData.fields));
            if(req.formData.files) {
                debug.log(JSON.stringify(req.formData.files));
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
	// Services
	var containerServices = {
		// Services Available to all Contexts
		getContexts : getContexts, 
		addContext : addContext,
		getContext : getContext
	};
	var adminServices = {
		getApplications : function() { return webapps; },
		getWebApp : getWebApp,
		getEnvironment : function() { return process.env; },
		restartApp : restartApp,		
		stopServer : function() {
			// status.running = false;
			// httpServer.close();
		}
	};
	// Public Section
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
	}
}