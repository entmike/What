var fs = require('fs');
var HttpServlet = require('./HttpServlet');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');
var Utils = require('./Utils');
var Cookie = require('./Cookie');
var gzip = require('./gzip').gzip;
var ServletConfig = require('./ServletConfig');

exports.create = function(options) {
	//Private
	var dateMask = "mm/dd/yy HH:MM:ss";
	var dateOffset = 1000 * 3600 * 6;
	// Parse Options
	options = options || {};
	// Context Name
	var name = options.name;
	// Context Path
	var path = options.path;
	theLog = [];
	var attributes = [];
	// Admin Services Handle
	var adminServices = options.adminServices;
	// Host Services Handle
	var hostServices = options.hostServices;	
	// Base Directory
	var appBase = options.appBase || null;
	// Session Manager
	var sessionManager = options.sessionManager;
	// Allow Directory Listing
	var allowDirectoryListing = options.allowDirectoryListing || false;
	// WebConfig Object
	var webConfig = options.webConfig;
	// Init Params - Used?
	var initParameters = webConfig.initParameters || {};	// Used?
	// Servlets Collection
	var servlets = [];
	// Servlet Mappings
	var servletMappings = webConfig.servletMappings;
	// Sort Mappings by URL Pattern
	servletMappings.sort(function(a,b){
		return (b.urlPattern.length - a.urlPattern.length);
	});
	// Path Translations
    var translations = webConfig.translations;

	var addMapping = function(servletName, url) {
		servletMappings.push({
			name : servletName,
			urlPattern : url
		});
		servletMappings.sort(function(a,b){
			return (b.urlPattern.length - a.urlPattern.length);
		});
	};
	var getServletMappings = function(servletName) {
		var mappings = [];
		for(var i=0;i<servletMappings.length;i++){
			if(servletName == servletMappings[i].name) {
				mappings.push(servletMappings[i].urlPattern);
			}
		}
		return mappings;
	};
	
	// Public
	var context = {
		init : function() {
			// Load Servlets
			for(var i=0;i<webConfig.servlets.length;i++) {
				var servletClass = webConfig.servlets[i].servletClass;
				var servletFile;
				if(servletClass.indexOf("/")==0 || servletClass.indexOf("./")==0) {	
					// Absolute Path
					servletFile = servletClass;
				}else{
					// Relative Path
					servletFile = appBase + "/webapps/" + name + "/WEB-INF/classes/" + servletClass;
				};
				try{
					var servletData = fs.readFileSync(servletFile);
					try{
						var servletOptions = eval("("+ servletData.toString() +")");
					}catch(e2){
						console.log(e2.stack.red);
					}
					var meta = webConfig.servlets[i];
					meta.servletType = "Standard";
					var options = {
						servletOptions : servletOptions,
						meta : webConfig.servlets[i]
					};
					this.loadServlet(options);
				}catch(e){
					console.log("Error initializing servlet [" + webConfig.servlets[i].name + "]\n\File: [" + servletFile + "].");
					console.log(e.stack.green);
				}
			}
		},
		loadNSP : function(options){
			var MIMEPath = options.MIMEPath;
			var MIME = options.MIME;
			console.log("Creating Servlet for: [" + MIMEPath + "] from NSP...");
			var servletOptions = HttpServlet.parseNSP(MIME.content.toString());
			var opts = {
				servletOptions : servletOptions,
				meta : {
					name : MIMEPath,
					description : "NSP File",
					servletClass : MIMEPath,
					servletType : "NSP"
				}
			};
			addMapping(MIMEPath, MIMEPath);
			servlet = this.loadServlet(opts);
			return servlet;
		},
		loadServlet : function(options) {
			// Create servlet Metadata Object
			var servletMeta = {
				options : options.servletOptions,		// doGet, doPost, etc
				meta : options.meta,					// From web.js
				stats : {}
			};
			// Instantiate Servlet
			var newServlet = HttpServlet.create(servletMeta);
			var servletConfig = ServletConfig.create({
				name : options.meta.name,
				initParameters : options.meta.initParams,
				servletContext : this
			});
			servletMeta.servlet = newServlet;
			// Attach Initialization Options to Metadata
			newServlet.init(servletConfig);
			servlets.push(servletMeta);
			console.log(" Servlet [" + newServlet.getServletConfig().getServletName() + "] created and inititialized.");
			return newServlet;
		},
		// NON-STANDARD
		getName : function() {
			return name;
		},
		getPath : function() {
			return path;
		},
		getAdminServices : function() {
			return adminServices;
		},
		getHostServices : function() {
			return hostServices;
		},
		// IMPLEMENTATION OF ServletContext Interface
		getAttribute : function(name) {
			// Returns the servlet container attribute with the given name, or null if there is no attribute by that name.
			return attributes[name];
		},
		getAttributeNames : function() {
			// Returns an Array containing the attribute names available within this servlet context.
			var attrs = [];
			for(key in attributes) attrs.push(key);
			return attrs;
		},
		getContext : function(uriPath) {
			// Returns a ServletContext object that corresponds to a specified URL on the server.
		},
		getInitParameter : function(name) {
			/* Returns a String containing the value of the named context-wide initialization parameter, 
			or null if the parameter does not exist.
			*/
			return initParameters[name];
		},
		getInitParameterNames : function() {
			var arr = [];
			for(key in initParameters) arr.push(key);
			return arr;
		},
		getMajorVersion : function() {
			return 2;
		},
		getMinorVersion : function() {
			return 3;
		},
		getNamedDispatcher : function(name) {
		
		},
		getResource : function(path) {
		
		},
		getResourceAsStream : function(path, callback) {
			
		},
		getResourcePaths : function(path){
		
		},
		getServerInfo : function() {
		
		},
		getServletContextName : function() {
			/* Returns the name of this web application correponding to this ServletContext as specified in 
			the deployment descriptor for this web application by the display-name element.*/
		},
		log: function(msg) {
			// Writes the specified message to a servlet log file, usually an event log.
			theLog.push(msg);
		},
		removeAttribute : function(name) {
			attributes[name] = null;
		},
		setAttribute : function(name, obj) {
			attributes[name] = obj;
		},
		// NON-STANDARD
		handleComplete : function(request, response){
			var acceptEncoding = getHeader("accept-encoding");
			if(acceptEncoding && acceptEncoding.toLowerCase().indexOf("gzip") > -1) {  // Accepts GZIP
				if(!response.isCommited()) {
					response.setHeader("Content-Encoding", "gzip");
					gzip({
						data : response.getOutputStream(),
						scope : response,
						callback : function(err, data) {
							this.setOutputStream(data);
							this.close();
						}
					});
				}else{ // Response is commited, cannot GZIP.
					response.close();
				}
			}else{ // Browser does not accept GZIP.
				response.close();
			}
			var rStatus = response.getStatus().toString();
			switch (rStatus){
				case "200" : rStatus = rStatus.green.bold; break;
				case "304" : rStatus = rStatus.cyan.bold; break;
				case "404" : rStatus = rStatus.red.bold; break;
				case "302" : rStatus = rStatus.yellow.bold; break;
				case "500" : rStatus = rStatus.red.bold; break;
				default : rStatus = rStatus.grey;
			}
			var now = new Date(new Date() - dateOffset);
			console.log("[" + response.getId() + "]\t[" + rStatus + "] [" + request.getRequestURI() + "]");
			var endMS = new Date().getTime();
			/*if(status.trace){
				addTrace({
					request : request,
					response : response
				});
			}*/
		},
		handle : function(options){
			var URL = options.URL;						// Requested URL
			var redirect = this.getTranslation(URL);	// Get translation/alias URL
			if(redirect) {
				res.writeHead(301, {"Location" : redirect});
				res.end();
				return;
			}
			var req = options.req;					// Node.JS Request
			var res = options.res;					// Node.JS Response
			var id = options.id;					// ID to tag Request and Response with.
			var scope = options.scope || this;		// Callback Scope
			// Create Cookies Collection from Node.JS Header for Servlet Request Constructor
			var cookieHeader = req.headers["cookie"];
			var cookies = [];		// Cookies Collection
			if(cookieHeader){
				var arrCookies = cookieHeader.split(";");
				for(var i=0;i<arrCookies.length;i++) {
					var kv = arrCookies[i].split("=");
					if(kv.length>1) {
						var key = kv[0].replace(/^\s*|\s*$/g,'');	// Trim Whitespace
						var val = kv[1];
						cookies.push(Cookie.create(key, val));
					};
				}
			}
			var JSESSIONID;		// Session ID for HttpRequest
			for(var i=0;i<cookies.length;i++) if(cookies[i].getName() == "JSESSIONID") JSESSIONID = cookies[i].getValue();
			var mapping = this.getMapping(URL);
			if(mapping) {
				var pathInfo = URL.substring(mapping.urlPattern.length);
				// Create HttpServletRequest and HttpServletResponse objects from NodeJS ones.
				var request = new HttpServletRequest.create({
					id : id,					// Tag Request with an ID
					req : req,					// Node.JS Request Obj
					JSESSIONID : JSESSIONID,	// Requested SessionID
					cookies : cookies,			// Cookies Collection
					contextPath : name,			// Name of WebApp (probably should do this a better way)
					servletPath : mapping.urlPattern,	// Servlet Path
					pathInfo : pathInfo,		// Path Info to the right of the servlet mapping
					sessionManager : sessionManager.services	// Session Manager Public Services
				});
				var response = new HttpServletResponse.create({
					id : id,
					res : res
				});
				var servlet = this.getServlet(mapping.name);
				if(servlet) {	// Servlet Exists
					var async = servlet.service(request, response, this.handleComplete, this);
				}else{
					// Should be a servlet but there's not one.  Issue HTTP 500 error response.
					response.setStatus(500);
					response.setHeader("Content-Type", "text/html");
					var template = Utils.getTemplate("500.tmpl");
					template = template.replace("<@title>", "Servlet Not Found!");
					template = template.replace("<@message>", "Servlet Not Loaded");
					template = template.replace("<@error>", "Servlet is not loaded but contains a mapping.  Check your class files.");
					response.getWriter().write(template);
					this.handleComplete(request, response);
				}
				console.log("[" + request.getId() + "]\tServlet:[" + mapping.name + "]");
				/* If servlet method is not asynchronous, issue complete handler.
				Otherwise, it's on the servlet to issue it via a callback. */
				if(!async) this.handleComplete(request, response);
			}else{	// No Mapping exists.  Issue 404 response directly to Node.JS Response Object.
				var template = Utils.getTemplate("404.tmpl");
				template = template.replace("<@title>", "404 - Resource Not Found!");
				template = template.replace("<@message>", "The requested resource [" + URL + "] was not found.");
				res.writeHead(404, {"Content-Type" : "text/html"});
				res.end(template);
			}
		},
		getConfig : function() {
            return webConfig;
        },
		addServlet : function(servlet) {
			servlets.push(servlet);
		},
		getName : function() {
			return name;
		},
        getServletMappings : getServletMappings,
		getMapping : function(url) {
			for(var i=0;i<servletMappings.length;i++) {
				if(url.indexOf(servletMappings[i].urlPattern)==0 || url==servletMappings[i].urlPattern) {
					return servletMappings[i];
				}
			}
			return null;
		},
		getTranslation : function (source) {
			if(!translations) return null;
			for(var i=0;i<translations.length;i++) {
				var translation = translations[i];
				for(var j=0;j<translation.source.length;j++) if(translation.source[j] == source) return translation.target;
			}
			return null;
		},
		getServlets : function() {
			return servlets;
		},
		removeServlet : function(name) {
			for(var i=0;i<servlets.length;i++) {
				if(servlets[i].servlet.getServletConfig().getServletName()==name) {
					var servlet = servlets[i];
					servlets.splice(i,1);
					return servlet;
				}
			}
			return null;
		},
		restartServlet : function(name) {
			var servlet = this.removeServlet(name);
			var servletFile = appBase + "/webapps/" + this.getName() + "/WEB-INF/classes/" + servlet.meta.servletClass;
			try{
				var servletData = fs.readFileSync(servletFile);
				try{
					var servletOptions = eval("("+ servletData.toString() +")");
				}catch(e2){
					console.log(e2.stack.red);
				}
				var options = {
					servletOptions : servletOptions,
					meta : servlet.meta
				};
				this.loadServlet(options);
			}catch(e){
				console.log("Error initializing servlet [" + name + "]\nFile: [" + servletFile + "].");
				console.log(e.stack.green);
			}
		},
		getServlet : function(name) {
			for(var i=0;i<servlets.length;i++) if(servlets[i].servlet.getServletConfig().getServletName()==name) return servlets[i].servlet;
			return null;
		},
        getServletMeta : function(name) {
			for(var i=0;i<servlets.length;i++) if(servlets[i].servlet.getServletConfig().getServletName()==name) return servlets[i];
			return null;
        }
	};
	return context;
};