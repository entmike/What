var PrintWriter = require('./PrintWriter');
var gzip = require('./gzip').gzip;

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
			var that = this;	// I suck at scope
			this.setHeader("Content-Encoding", "gzip");
			response.writeHead(this.getStatus(), this.getHeaders());
			gzip(this.getOutputStream(), function(err, data){
				var writer = that.getWriter();
				writer.setStream(data);
				writer.flush();
				response.write(that.getOutputStream(), "binary");
				response.end();
			});
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
	};
};