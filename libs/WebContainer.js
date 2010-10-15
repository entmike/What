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
	var loadWebApps = function() {
		/* 
		Scan Web Container's webapps folder for Applications
		*/
		debug.log ("Scanning for webapps...");
		var wa = fs.readdirSync("webapps");
		for(var i=0;i<wa.length;i++) {
			// Get 'webapps' directory contents
			var wb = fs.readdirSync("webapps/"+wa[i]);
			for(var j=0;j<wb.length;j++) {
				// Look for 'WEB-INF' directory
				if(wb[j]=="WEB-INF") {
					try{	// See if there's a web.js file
						// Look for 'web.js' file
						var data = fs.readFileSync("webapps/" + wa[i] + "/WEB-INF/web.js");
						// Load Web Config for App
						var webConfig = eval("(" + fs.readFileSync("webapps/" + wa[i] + "/WEB-INF/web.js").toString() + ")");
						// Create Web App
						var webApp = WebApplication.create({
							appName : wa[i],
							webConfig : webConfig,
							containerServices : containerServices
						});
						// Push WebApp into collection
						webapps.push(webApp);
					}catch(e){
						// No web.js file.  Not a web app.
					}
				}
			}
		}
	};
	var debug = {
		log : function(msg) { if(config.debug) 
			console.log("[" + status.counter + "]" + msg); 
		}
	};
	var getContexts = function() {
		// Get all WebApp contexts
		return contexts;
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
		for(var i=0;i<webapps.length;i++) if(name.indexOf(webapps[i].getName()) == 1) return webapps[i];
		return null;
	}
	var	MIMEinfo = function(ext) {
		// Get MIME type for extension
		for(var i=0;i<config.mimeTypes.length;i++) {
			if(config.mimeTypes.ext == ext) return config.mimeTypes[i]
		}
		return "text/plain";
	}
	var getMIME = function(path) {
		// Load MIME Resource and return as object w/some feedback
		var ext;
		var dots = path.split(".");
		if(dots.length>0) ext=(dots[dots.length-1]);
		var MIME = {};
		var data = null;
		try{
			data = fs.readFileSync(path);
			MIME.found = true;
			MIME.ext = ext;
			MIME.path = path;
			MIME.content = data;
			MIME.mimeType = MIMEinfo(ext);
		}catch(e){
			debug.log("MIME not found.");
			debug.log(e);
			MIME.found = false;
			MIME.path = path;
			MIME.content = "Resource [" + path + "] not found.";
		}
		return MIME;
	}
	var listener = function(req, res) {
		// Create HttpServletRequest and HttpServletResponse objects from NodeJS ones.
		var request = new HttpServletRequest.HttpServletRequest(req);
		var response = new HttpServletResponse.HttpServletResponse(res);
		var writer = response.getWriter();
		// Node.JS listener handler
		status.counter++;		// Internal Counter
		var URL = url.parse(req.url, true);
		debug.log("Incoming Request : [" + URL.pathname + "]");
		var webApp = getWebApp(URL.pathname);
		if(webApp) {			// Web App
			debug.log("Found App: [" + webApp.getName() + "]");
			var webAppURL = URL.pathname.substring(webApp.getName().length + 1); 	// Slice off webapp portion of URL
			var mapping = webApp.getMapping(webAppURL);
			if(mapping) {
				var servlet = webApp.getServlet(mapping.name);
				if(servlet) {	// Servlet Exists
					debug.log("Found Servlet: [" + servlet.getServletConfig().getServletName() + "]");
					servlet.service(request, response);
				}else{
					// Should be a servlet but there's not one.  To-do: Error message
					response.setStatus(500);
					response.setHeader("Content-Type", "text/plain");
					writer.write("Servlet not found!");
				}
			}else{	// No mapping, try a MIME from webapps/[app]/...
				var MIMEPath = "webapps" + URL.pathname;
				var forbidPath = "webapps/" + webApp.name + "/WEB-INF/";
				if(MIMEPath.indexOf(forbidPath) == 0){ // Forbid /WEB-INF/ listing
					debug.log("Forbidding WEB-INF: [" + forbidPath + "]");
					response.setStatus(403);
					response.setHeader("Content-Type", "text/plain");
					writer.write("Forbidden");
				}else{	// Non-forbidden, check MIMEs
					var MIME = getMIME(MIMEPath);
					if(MIME.found) {
						if(MIME.ext == "nsp") {		// NSP page
							var servlet = webApp.getServlet(MIMEPath);
							if(!servlet) {			// Initial NSP request, create servlet.
								debug.log("Creating Servlet for: [" + MIMEPath + "] from NSP...");
								servlet = HttpServlet.create(HttpServlet.parseNSP(MIME.content.toString()));
									var servletConfig = ServletConfig.create({
									name : MIMEPath,
									servletContext : webApp.getContext()
								});
								servlet.init(servletConfig);
								webApp.addServlet(servlet);
							}
							// Call Servlet Service
							servlet.service(request, response);
						}else{// General MIME type
							response.setStatus(200);
							response.setHeader("Content-Type", MIME.mimeType.mimeType);
							writer.setStream(MIME.content);
						}
					}else{
						response.setStatus(200);
						response.setHeader("Content-Type", "text/plain");
						writer.setStream(MIME.content);
					}
				}
			}
		}else{ // Not a webapp, try a MIME from webroot
			var MIME = getMIME("webroot" + URL.pathname);
			if(MIME.found) {
				response.setStatus(200);
				response.setHeader("Content-Type", MIME.mimeType.mimeType);
			}else{
				response.setStatus(404);
				response.setHeader("Content-Type", "text/plain");
			}
			writer.setStream(MIME.content);
		}
		debug.log("Response complete - Status Code [" + response.getStatus() + "]");
		response.flushBuffer();
	};
	// Services
	var containerServices = {
		// Services Available to all Contexts
		getContexts : getContexts, 
		addContext : addContext,
		getContext : getContext
	};
	// Public Section
	return {
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