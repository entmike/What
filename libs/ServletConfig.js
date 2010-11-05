exports.create = function(options) {
	//Private
		var options = options || {};
		var servletName = options.name;
		var servletContext = options.servletContext;
		var initParameters = options.initParameters || {};
	//Public
	return {
		getInitParameter : function(name) {
			return initParameters[name];
		},
		getInitParameterNames : function() {
			var arr = [];
			for(key in initParameters) arr.push(key);
			return arr;
		},
		getServletContext : function() {
			return servletContext;
		},
		getServletName : function(){
			return servletName;
		}
	};
};