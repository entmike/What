var fs = require('fs');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');
var HttpServlet = require('./HttpServlet');
var Utils = require('./Utils');

exports.create = function(options) {
	// Private
	options = options || {};
	// WebApp Name
	var name = options.appName;
	// WebApp Config Object
	var webConfig = options.webConfig;
	// Servlets Collection
	var servlets = [];
	// Servlet Mappings
	var servletMappings = webConfig.servletMappings;
	// Path Translations
    var translations = webConfig.translations;
	// Application Context
    var context = ServletContext.ServletContext({
		path : name,
		initParameters : webConfig.contextParams,
		containerServices : options.containerServices,
		adminServices : options.adminServices
	});
    var loadServlet = function(options) {
		// Create Servlet Metadata Wrapper
		var meta = options.meta;
		var servletOptions = options.servletOptions;
		// Create servlet Metadata Object
		var servletMeta = {};
		servletMeta.options = servletOptions;
		servletMeta.meta = meta;
		// Instantiate Servlet
		var newServlet = HttpServlet.create(servletOptions);
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
		var servletFile = "webapps/" + name + "/WEB-INF/classes/" + webConfig.servlets[i].servletClass;
		try{
			var servletData = fs.readFileSync(servletFile);
			try{
				var servletOptions = eval("("+ servletData.toString() +")");
			}catch(e2){
				console.log(e2.stack.red);
			}
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
		/**
		 * Request Handler
		 * @param {Object} options
		 */
		handle : function(options){
			// See if there's a servlet
			var mapping = this.getMapping(options.URL);
			var URL = options.URL;
			var request = options.request;
			var response = options.response;
			var callback = options.callback;
			var scope = options.scope || this;
			var that = this;	// I suck at scope, ok?
			var writer = response.getWriter();
			if(mapping) {
				var servlet = this.getServlet(mapping.name);
				if(servlet) {	// Servlet Exists
					console.log("Found Servlet: [" + servlet.getServletConfig().getServletName() + "]");
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
				callback(request, response);
			}else{	// No mapping, try a MIME from webapps/[app]/...
				var MIMEPath = "webapps/" + this.getName() + URL;
				var forbidPath = "webapps/" + this.getName() + "/WEB-INF";
				if(MIMEPath.indexOf(forbidPath) == 0){ // Forbid /WEB-INF/ listing
					console.log("Forbidding WEB-INF: [" + forbidPath + "]");
					response.setStatus(403);
					response.setHeader("Content-Type", "text/html");
					var template = getTemplate("403.tmpl");
					template = template.replace("<@message>", "WEB-INF listing is forbidden.");
					template = template.replace("<@title>", "WEB-INF listing is forbidden.");
					writer.write(template);
				}else{	// Non-forbidden, check MIMEs
					Utils.getMIME({
						modSince : request.getHeader("If-Modified-Since"),
						cacheControl : request.getHeader("Cache-Control"),
						path : MIMEPath,
						relPath : "/" + this.getName() + URL,
						scope : this,
						callback: function(MIME) {
							switch(MIME.status) {
								// OK
								case 200:
									if(MIME.ext == "nsp") {		// NSP page
										var servlet = this.getServlet(MIMEPath);
										if(!servlet) {			// Initial NSP request, create servlet.
											console.log("Creating Servlet for: [" + MIMEPath + "] from NSP...");
											var servletOptions = HttpServlet.parseNSP(MIME.content.toString());
											var options = {
												servletOptions : servletOptions,
												meta : {
													name : MIMEPath,
													description : "NSP File",
													servletClass : ".NSP"
												}
											};
											servlet = this.loadServlet(options);
										}
										// Call Servlet Service
										servlet.service(request, response);
									}else{// General MIME type
										response.setStatus(MIME.status);
										response.setHeader("Content-Type", MIME.mimeType.mimeType);
										response.setHeader("Last-Modified", MIME.modTime);
										writer.setStream(MIME.content);
									}
								break;
								// Cache
								case 304:
									response.setStatus(MIME.status);
									response.setHeader("Content-Type", "");
								break;
								// Not found
								case 404:
									response.setStatus(MIME.status);
									response.setHeader("Content-Type", MIME.mimeType.mimeType);
									writer.setStream(MIME.content);
								break;
								// All others
								default:
									response.setStatus(MIME.status);
									response.setHeader("Content-Type", MIME.mimeType.mimeType);
									writer.setStream(MIME.content);
							}
							callback.call(scope, request, response);
						}
					});
				}
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
        getMapping : function(urlPattern) {
			// To-do: pattern matching
			for(var i=0;i<servletMappings.length;i++) {
				if(urlPattern == servletMappings[i].urlPattern) {
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
			console.log(servlet.meta.servletClass);
			var servletFile = "webapps/" + this.getName() + "/WEB-INF/classes/" + servlet.meta.servletClass;
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