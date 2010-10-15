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
	var context = ServletContext.ServletContext({
		path : name,
		initParameters : webConfig.contextParams,
		containerServices : options.containerServices
	});
	for(var i=0;i<webConfig.servlets.length;i++) {
		var servletFile = "webapps/" + name + "/WEB-INF/classes/" + webConfig.servlets[i].servletClass;
		var servletData = fs.readFileSync(servletFile);
		var servletOptions = eval("("+ servletData.toString() +")");
		// Instantiate Servlet
		var newServlet = HttpServlet.create(servletOptions);
		var servletConfig = ServletConfig.create({
			name : webConfig.servlets[i].name,
			initParameters : webConfig.servlets[i].initParams,
			servletContext : context
		});
		newServlet.init(servletConfig);
		servlets.push(newServlet);
		console.log(" Servlet [" + servlets[i].getServletConfig().getServletName() + "] created and inititialized.");
	}
	// Public
	return {
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
		getServlet : function(name) {
			for(var i=0;i<servlets.length;i++) if(servlets[i].getServletConfig().getServletName()==name) return servlets[i];
			return null;
		}
	};
}