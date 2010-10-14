// Required Packages
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var HttpServlet = require('./HttpServlet');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');
var ServletConfig = require('./ServletConfig');
var ServletContext = require('./ServletContext');

exports.create = function() {
	/*
	===============================================
	Private Section
	===============================================
	*/
	// NodeJS HTTP Server
	var httpServer = null;
	// ServletContext Collection
	var contexts = [];
	// Servlets Collection
	var servlets = [];
	// HTTP Request Log
	var requestLog = [];
	// Web Applications
	var webapps = [];
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
			var wb = fs.readdirSync("webapps/"+wa[i]);
			for(var j=0;j<wb.length;j++) {
				if(wb[j]=="WEB-INF") {
					loadWebApp(wa[i]);
				}
			}
		}
	}
	var loadWebApp = function(appName) {
		/* 
		Load & Create WebApp
		*/
		// Load web.js config file for app
		var webConfig = eval("(" + fs.readFileSync("webapps/" + appName + "/WEB-INF/web.js").toString() + ")");
		// Create Web App (turn into a class eventually)
		var webApp = {
			name : appName,
			config : webConfig,
			servlets : [],
			servletMappings : [],
			context : ServletContext.ServletContext({
				path : appName,
				initParameters : webConfig.contextParams,
				containerServices : containerServices
			}),
			getMapping : function(urlPattern) {
				for(var i=0;i<this.servletMappings.length;i++) if(urlPattern == this.servletMappings.urlPattern) return this.servletMappings[i];
				// To-do: pattern matching
				// for(var i=0;i<this.servletMappings.length;i++) if(urlPattern.indexOf(this.servletMappings.urlPattern == 0)) return this.servletMappings[i];
				return null;
			},
			getServlet : function(name) {
				for(var i=0;i<this.servlets.length;i++) if(this.servlets[i].getServletConfig().getServletName()==name) return this.servlets[i];
				return null;
			}
		};
		// Copy servlet mappings
		webApp.servletMappings = webConfig.servletMappings;
		// Instantiate Servlets
		for(var i=0;i<webConfig.servlets.length;i++) {
			var options = eval("("+ fs.readFileSync("webapps/" + webApp.name + "/WEB-INF/classes/" + webConfig.servlets[i].servletClass).toString()+")");
			// Instantiate Servlet
			var newServlet = HttpServlet.create(options);
			var servletConfig = ServletConfig.create({
				name : webConfig.servlets[i].name,
				initParameters : webConfig.servlets[i].initParams,
				servletContext : webApp.context
			});
			newServlet.init(servletConfig);
			webApp.servlets.push(newServlet);
			debug.log(" Servlet [" + webApp.servlets[i].getServletConfig().getServletName() + "] created and inititialized.");
		}
		// Push WebApp into collection
		webapps.push(webApp);
	}
	var debug = {
		log : function(msg) { if(config.debug) console.log(msg); }
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
		for(var i=0;i<webapps.length;i++) if(name.indexOf(webapps[i].name) == 1) return webapps[i];
		return null;
	}
	var	MIMEinfo = function(ext) {
		// Get MIME type for extension
		for(var i=0;i<config.mimeTypes.length;i++) {
			if(config.mimeTypes.ext == ext) return config.mimeTypes[i]
		}
		return null;
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
	var listener = function(request, response) {
		// Node.JS listener handler
		status.counter++;		// Internal Counter
		var URL = url.parse(request.url, true);
		debug.log("Incoming Request : [" + URL.pathname + "]");
		var webApp = getWebApp(URL.pathname);
		if(webApp) {			// Web App
			debug.log("Found App: [" + webApp.name + "]");
			var webAppURL = URL.pathname.substring(webApp.name.length + 1); 	// Slice off webapp portion of URL
			var mapping = webApp.getMapping(webAppURL);
			if(mapping) {
				var servlet = webApp.getServlet(mapping.name);
				if(servlet) {	// Servlet Exists
					servlet.service(
						new HttpServletRequest.HttpServletRequest(request),
						new HttpServletResponse.HttpServletResponse(response)
					);
				}else{
					// Should be a servlet but there's not one.  To-do: Error message
					response.end();
				}
			}else{	// No mapping, try a MIME from webapps/[app]/...
				var MIMEPath = "webapps" + URL.pathname;
				var forbidPath = "webapps/" + webApp.name + "/WEB-INF/";
				if(MIMEPath.indexOf(forbidPath) == 0){ // Forbid /WEB-INF/ listing
					debug.log("Forbidding WEB-INF...");
					response.writeHead(403, {"Content-Type" : "text/plain"});
					response.end("403 - Forbidden");
				}else{	// Non-forbidden, check MIMEs
					var MIME = getMIME(MIMEPath);
					if(MIME.found) {
						if(MIME.ext == "nsp") {		// NSP page
							var servlet = webApp.getServlet(MIMEPath);
							if(!servlet) {
								console.log("Creating Servlet for: [" + MIMEPath + "]...");
								var servletOptions = NSP2Servlet(MIME.content.toString());
								var newServlet = HttpServlet.create(servletOptions);
									var servletConfig = ServletConfig.create({
									name : MIMEPath,
									servletContext : webApp.context
								});
								newServlet.init(servletConfig);
								webApp.servlets.push(newServlet);
								newServlet.service(
									new HttpServletRequest.HttpServletRequest(request),
									new HttpServletResponse.HttpServletResponse(response)
								);
							}else{
								servlet.service(
									new HttpServletRequest.HttpServletRequest(request),
									new HttpServletResponse.HttpServletResponse(response)
								);
							}
						}else{						// General MIME type
							response.writeHead(200, {"Content-Type" : MIME.mimeType.mimeType});
						}
						
					}else{
						response.writeHead(404, {"Content-Type" : "text/plain"});
					}
					response.end(MIME.content);
				}
			}
		}else{
			// Not a webapp, try a MIME from webroot
			var MIME = getMIME("webroot" + URL.pathname);
			if(MIME.found) {
				response.writeHead(200, {"Content-Type" : {}});
			}else{
				response.writeHead(404, {"Content-Type" : "text/plain"});
			}
			response.end(MIME.content);
		}
		debug.log("Response complete");
	};
	function NSP2Servlet(contents){
		var steps = [];
		var externalSteps = [];
		var tags = { start : "<%", writer : "=", global : "!", end : "%>" }
		var lines = contents.split(new RegExp( "\\n", "g" ));
		var inScript = false;
		var currentScript =[];
		for(var i=0;i<lines.length;i++){	// Loop through raw .nsp content
			var line = lines[i];
			while(line.length>0){ 	// While Loop over a single line until it is parsed out to 0 bytes.
				if(!inScript){		// Outside of Script
					var startIndex = line.indexOf(tags.start);
					if(line.indexOf(tags.start)==-1) {		// Normal Text
						steps.push('writer.write(unescape("' + escape(line + "\n") + '"));\n');
						line="";
					}else{			// Found start of script tag
						var lineBeforeStart = line.substring(0, startIndex);
						steps.push('writer.write(unescape("' + escape(lineBeforeStart) + '"));');
						line = line.substring(startIndex + tags.start.length);
						if(line.length==0) steps.push("\n");
						inScript = true;
					}
				}else{				// Inside Script
					var endIndex = line.indexOf(tags.end);
					if(line.indexOf(tags.end)==-1){			// Line of Script
						currentScript.push(line + "\n");
						line="";
					}else{			// Found end of script tag
						lineBeforeEnd = line.substring(0,endIndex);
						currentScript.push(lineBeforeEnd);
						var theScript = currentScript.join("");			// End of Script Block
						if(theScript.indexOf(tags.writer) === 0){ 		// <%=...%> shorthand
							theScript = "writer.write(" + theScript.substring(tags.writer.length) + ");";
							steps.push(theScript);
						}else if(theScript.indexOf(tags.global) === 0){ // <%!...%> footer
							theScript = theScript.substring(tags.global.length);
							externalSteps.push(theScript);
						}else{
							steps.push(theScript);			// Push Script to Parsed Stack
						}
						currentScript = [];								// Reset Script Stack
						line = line.substring(endIndex+tags.end.length);
						if(line.length==0) steps.push("\n");
						inScript = false;
					}
				}
			}
		}
		// Add a few implicit variables
		var instructions = [ 
			"response.setHeader(\"Content-Type\", \"text/html\");",
			"var writer = response.getWriter();",
			"var config = this.getServletConfig();",
			"var pageContext = this.getServletContext();",
			"var application = this.getServletConfig().getServletContext();",	
			steps.join(""), externalSteps.join("")
		].join("");
		// Create servlet options for servlet constructor
		var servletOptions = {
			doGet : function(request, response) {
				eval(instructions.toString());
			},
			doPost : function(request, response) {
				eval(instructions.toString());
			},
			doDelete : function(request, response) {
				eval(instructions.toString());
			},
			doPut : function(request, response) {
				eval(instructions.toString());
			}
		}
		return servletOptions;	
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