exports.ServletContext = function(options) {
	options = options || {};
	if(!options.path) options.path = "/";
	return options.containerServices.getContext(options.path) || createServletContext(options);
};
createServletContext = function(options) {
	//Private
	theLog = [];
	var attributes = [];
	var adminServices = options.adminServices;
	var containerServices = options.containerServices;	
	var initParameters = options.initParameters || {};
	//Public
	var context = {
		getAdminServices : function() {
			return adminServices;
		},
		getContainerServices : function() {
			return containerServices;
		},
		log: function(msg) {
			// Writes the specified message to a servlet log file, usually an event log.
			theLog.push(msg);
		},
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
		getResourceAsStream : function(path) {
		
		},
		getResourcePaths : function(path){
		
		},
		getServerInfo : function() {
		
		},
		getServletContextName : function() {
		
		},
		removeAttribute : function() {
		
		},
		setAttribute : function(name, obj) {
			attributes[name] = obj;
		}
	};
	options.containerServices.addContext({path: options.path, context: context});
	console.log("Context [" + options.path + "] created.");
	return context;
};