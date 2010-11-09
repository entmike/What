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
		bufferCallback : function(err, data) {
			console.log(this.getStatus().toString().yellow);
			if(this.getStatus() != 304) {
				var writer = this.getWriter();
				writer.setStream(data);
				writer.flush();
				console.log(this.getStatus());
				response.write(this.getOutputStream(), "binary");
			}
			response.end();
		},
		flushBuffer : function() {
			this.getWriter().flush();
			var self = this;	// I suck at scope
			this.setHeader("Content-Encoding", "gzip");
			console.log(this.getStatus().toString.blue);
			response.writeHead(this.getStatus(), this.getHeaders());
			gzip({
				data: this.getOutputStream(),
				callback : self.bufferCallback,
				scope : self
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