exports.create = function(options) {
	// Private
	var id = options.id;
	var request = options.req;
	var parameters = request.formData;
	var cookies = options.cookies;
	var JSESSIONID = options.JSESSIONID;
	var servletPath = options.servletPath;
	var contextPath = options.contextPath;
	var pathInfo = options.pathInfo;
	var session;
	var sessionManager = options.sessionManager;
	var IP = request.connection.remoteAddress;
	// Public
	return {
		toString : function() { return "HttpServletRequest"; },
		getIPAddress : function() {
			return IP;
		},
		getId : function() {
			return id;
		},
		getAuthType : function() { /* Stub */ },
		getCookies : function() { 
			return cookies;
		},
		getDateHeader : function(name) { /* Stub */ },
		getHeader : function(name) { 
			return(request.headers[name.toLowerCase()]);
		},
		getHeaders : function() { 
			// Returns all header values
			return(request.headers);
		},
		getHeaderNames : function() { /* Stub */ },
		getIntHeader : function(name) { /* Stub */ },
		getMethod : function() {
			return request.method;
		},
		getPathInfo : function() { 
			return pathInfo;
		},
		getParameter : function(name) {
			return parameters[name];
		},
		getParameterNames : function() {
			var arr = [];
			for(p in parameters) arr.push(p);
			return arr;
		},
		getPathTranslated : function() { /* Stub */ },
		getContextPath : function() { 
			return contextPath;
		},
		getFormData : function() {
			return request.formData;
		},
		getQueryString : function() {
			var obj = require('url').parse(request.url).query;
			return obj || "";
		},
		isUserInRole : function(role) { /* Stub */ },
		getUserPrincipal : function() { /* Stub */ },
		getRequestedSessionId : function() { 
			return JSESSIONID;
		},
		getRequestURI : function() {
			return require('url').parse(request.url).pathname;
		},
		getServletPath : function() {
			return servletPath;
		},
		getSession : function(create) { 
			if(session) return session
			var s = sessionManager.getSession(JSESSIONID);
			if(!s && create) {
				console.log("Could not find requested session [" + JSESSIONID + "].  Creating new session.");
				s = sessionManager.newSession();
			}
			session = s;
			return s;
		},
		isRequestedSessionIdValid : function() { 
			if(sessionManager.getSession(JSESSIONID)) {
				return true;
			}else{
				return false;
			}
		},
		isRequestedSessionIdFromCookie : function() { /* Stub */ },
		isRequestedSessionIdFromURL : function() { /* Stub */ }
	};
};