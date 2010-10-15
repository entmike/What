var PrintWriter = require('./PrintWriter');

exports.HttpServletResponse = function(res) {
	var response = res;
	var status = null;
	var contentLength = 0;
	var printWriter = new PrintWriter.PrintWriter(response);
	var headers = {};
	// Public
	return {
		toString : function() {
			return "HttpServletResponse";
		},
		flushBuffer : function() {
			this.getWriter().flush();
			response.writeHead(this.getStatus(), this.getHeaders());
			response.write(this.getOutputStream(), "binary");
			response.end();
		},
		setHeader : function(key, value) {
			headers[key] = value;
		},
		getHeader : function(key) {
			return header[key];
		},
		setHeaders : function(obj) {
			headers = obj;
		},
		getHeaders : function() {
			return headers;
		},
		setStatus : function(s) {
			status = s;
		},
		getStatus : function() {
			return status;
		},
		setContentType : function(contentType) {
			this.contentType = contentType;
		},
		getContentType : function() {
			return contentType;
		},
		setContentLength : function(contentLength) {
			this.contentLength = contentLength;
		},
		addCookie : function(cookie) { },
		getWriter : function() {
			return printWriter;
		},
		getOutputStream : function() { 
			return this.getWriter().getStream();
		},
		sendRedirect : function(location) {
			this.setStatus(302);
			this.getWriter().write(location);
			this.flushBuffer();
		},
		sendError : function(status, msg) {
			this.setStatus(status);
			this.setHeaders({"Content-Type" : "text/plain"});
			this.getWriter().write(msg.message);
			this.flushBuffer();
		}
	}
}