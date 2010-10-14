exports.create = function(options) {
	//Private
		var options = options || {};
		var servletName = options.name;
		var servletContext = options.servletContext;
	//Public
	return {
		getInitParameter : function(name) {
			
		},
		getInitParameterNames : function() {
			
		},
		getServletContext : function() {
			return servletContext;
		},
		getServletName : function(){
			return servletName;
		}
	}
}