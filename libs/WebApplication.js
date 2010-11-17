var fs = require('fs');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');
var HttpServlet = require('./HttpServlet');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');
var Utils = require('./Utils');
var Cookie = require('./Cookie');
var gzip = require('./gzip').gzip;

exports.create = function(options) {
	// Private
	var dateMask = "mm/dd/yy HH:MM:ss";
	var dateOffset = 1000 * 3600 * 6;
	options = options || {};
	// Base Directory
	var appBase = options.appBase || null;
	// Session Manager
	var sessionManager = options.sessionManager;
	// Allow Directory Listing
	var allowDirectoryListing = options.allowDirectoryListing || false;
	// WebApp Name
	var name = options.appName;
	// WebApp Config Object
	var webConfig = options.webConfig;
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
	// Application Context
    var context = ServletContext.ServletContext({
		path : name,
		initParameters : webConfig.contextParams,
		hostServices : options.hostServices,
		adminServices : options.adminServices
	});
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
	var loadNSP = function(options){
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
		servlet = loadServlet(opts);
		return servlet;
	}
    var loadServlet = function(options) {
		// Create Servlet Metadata Wrapper
		var meta = options.meta;
		var servletOptions = options.servletOptions;
		// Create servlet Metadata Object
		var servletMeta = {
			options : servletOptions,
			meta : meta,
			stats : {}
		};
		// Instantiate Servlet
		var newServlet = HttpServlet.create(servletOptions, servletMeta);
		var servletConfig = ServletConfig.create({
			name : meta.name,
			initParameters : meta.initParams,
			servletContext : context
		});
		servletMeta.servlet = newServlet;
		// Attach Initialization Options to Metadata
		newServlet.init(servletConfig);
		servlets.push(servletMeta);
		console.log(" Servlet [" + newServlet.getServletConfig().getServletName() + "] created and inititialized.");
		return newServlet;
	};
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
			loadServlet(options);
		}catch(e){
			console.log("Error initializing servlet [" + webConfig.servlets[i].name + "]\n\File: [" + servletFile + "].");
            console.log(e.stack.green);
		}
	}
	// Public
	return {
		handleComplete : function(request, response){
			if(request.getHeader("accept-encoding").toLowerCase().indexOf("gzip") > -1) {  // Accepts GZIP
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
		/**
		 * Request Handler
		 * @param {Object} options
		 */
		handle : function(options){
			var URL = options.URL;
			URL = this.getTranslation(URL) || URL;
			var req = options.req;
			var res = options.res;
			var id = options.id;
			// Create Cookies Collection from Node.JS Header for Servlet Request Constructor
			var cookieHeader = req.headers["cookie"];
			var cookies = [];
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
			var JSESSIONID;
			for(var i=0;i<cookies.length;i++) if(cookies[i].getName() == "JSESSIONID") JSESSIONID = cookies[i].getValue();
			var scope = options.scope || this;
			var that = this;	// I suck at scope, ok?
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
				var writer = response.getWriter();	// Shortcut Handle to the PrintWriter for the response
				var servlet = this.getServlet(mapping.name);
				if(servlet) {	// Servlet Exists
					var async = servlet.service(request, response, this.handleComplete, this);
				}else{
					// Should be a servlet but there's not one.  To-do: Error message
					response.setStatus(500);
					response.setHeader("Content-Type", "text/html");
					var template = Utils.getTemplate("500.tmpl");
					template = template.replace("<@title>", "Servlet Not Found!");
					template = template.replace("<@message>", "Servlet Not Loaded");
					template = template.replace("<@error>", "Servlet is not loaded but contains a mapping.  Check your class files.");
					writer.write(template);
				}
				console.log("[" + request.getId() + "]\tServlet:[" + mapping.name + "]");
				if(!async) this.handleComplete(request, response);
			}
		},
		getConfig : function() {
            return webConfig;
        },
        loadServlet : loadServlet,
		addServlet : function(servlet) {
			servlets.push(servlet);
		},
		getName : function() {
			return name;
		},
		getContext : function() {
			return context;
		},
        getServletMappings : getServletMappings,
		getMapping : function(url) {
			for(var i=0;i<servletMappings.length;i++) {
				if(url.indexOf(servletMappings[i].urlPattern)==0) return servletMappings[i];
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
				loadServlet(options);
			}catch(e){
				console.log("Error initializing servlet [" + webConfig.servlets[i].name + "]\nFile: [" + servletFile + "].");
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
};