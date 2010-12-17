exports.create = function(options) {
	// Private
	var id = options.id;
	// Node.JS Request Object
	var request = options.req;
	// Cookies
	var cookies = options.cookies;
	// Requested Session ID
	var JSESSIONID = options.JSESSIONID;
	var servletPath = options.servletPath;
	var contextPath = options.contextPath;
	var pathInfo = options.pathInfo;
	var session;
	var sessionManager = options.sessionManager;
	// IP Address of client
	var IP = request.connection.remoteAddress;
	// Query String
	var queryString = require('url').parse(request.url).query || "";
	// Gather up GET and POST parameters
	var postParameters = request.formData.fields || {};
	var getParameters = require("querystring").parse(queryString) || {};
	// Consolidate them
	var parameters = postParameters;
	for(gp in getParameters) {
		if(parameters[gp]) {
			parameters[gp]="," + getParameters[gp];
		}else{
			parameters[gp] = getParameters[gp];
		}
	}
	// console.log(parameters);
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
		getParameter : function(p) {
			return (parameters[p] || null);
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
			return queryString;
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
			if(session) return session;
			// Find session based on following signature key
			var s = sessionManager.getSession({
				id : JSESSIONID,
				ipAddress : IP,
				userAgent : request.headers["user-agent"]
			});
			if(!s && create) {
				console.log("Could not find requested session [" + JSESSIONID + "].  Creating new session.");
				// Create new Session with following signature key
				s = sessionManager.newSession({
					ipAddress : IP,
					userAgent : request.headers["user-agent"]
				});
			}
			session = s;
			return s;
		},
		isRequestedSessionIdValid : function() { 
			if(sessionManager.isValid(JSESSIONID)) {
				return true;
			}else{
				return false;
			}
		},
		isRequestedSessionIdFromCookie : function() { /* Stub */ },
		isRequestedSessionIdFromURL : function() { /* Stub */ }
	};
};