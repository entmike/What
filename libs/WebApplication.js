var fs = require('fs');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');
var HttpServlet = require('./HttpServlet');

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
			console.log("Error initializing servlet [" + webConfig.servlets[i].name + "]\n\
File: [" + servletFile + "].");
            console.log(e.stack.green);
		}
	}
	// Public
	return {
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
}