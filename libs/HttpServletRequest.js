exports.HttpServletRequest = function(req) {
	// Private
	var request = req;
	// Public
	return {
		toString : function() { return "HttpServletRequest" },
		getAuthType : function() { /* Stub */ },
		getCookies : function() { /* Stub */ },
		getDateHeader : function(name) { /* Stub */ },
		getHeader : function(name) { /* Stub */ },
		getHeaders : function() { 
			// Returns all header values
			return(request.headers);
		},
		getHeaderNames : function() { /* Stub */ },
		getIntHeader : function(name) { /* Stub */ },
		getMethod : function() {
			return request.method;
		},
		getPathInfo : function() { /* Stub */ },
		getPathTranslated : function() { /* Stub */ },
		getContextPath : function() { /* Stub */ },
		getQueryString : function() {
			var obj = require('url').parse(request.url).query;
			return obj || "";
		},
		isUserInRole : function(role) { /* Stub */ },
		getUserPrincipal : function() { /* Stub */ },
		getRequestedSessionId : function() { /* Stub */ },
		getRequestURI : function() {
			return require('url').parse(request.url).pathname;
		},
		getServletPath : function() {
			return require('url').parse(request.url).pathname;
		},
		getSession : function(create) { /* Stub */ },
		isRequestedSessionIdValid : function() { /* Stub */ },
		isRequestedSessionIdFromCookie : function() { /* Stub */ },
		isRequestedSessionIdFromURL : function() { /* Stub */ }
	};
};