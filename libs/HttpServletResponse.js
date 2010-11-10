var Utils = require('./Utils');
var PrintWriter = require('./PrintWriter');
var Cookie = require('./Cookie');
var gzip = require('./gzip').gzip;

exports.create = function(options) {
	var response = options.res;
	var status = null;
	var contentLength = 0;
	var printWriter = new PrintWriter.PrintWriter(response);
	var headers = {};
	var cookies = [];
	// Public
	return {
		toString : function() {
			return "HttpServletResponse";
		},
		bufferCallback : function(err, data) {
			if(this.getStatus() != 304) {
				var writer = this.getWriter();
				writer.setStream(data);
				writer.flush();
				response.write(this.getOutputStream(), "binary");
			}else{
				// 304, do not write anything to response body
			}
			response.end();
		},
		flushBuffer : function() {
			this.getWriter().flush();
			var self = this;	// I suck at scope
			this.setHeader("Content-Encoding", "gzip");
			var cookieHeader = "";
			for(var i=0;i<cookies.length;i++){
				// Need to figure out how to set multiple cookies
				this.setHeader("Set-Cookie", cookies[i].getName() + "=" + cookies[i].getValue() + ";path=/;");
			}
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
		addCookie : function(cookie) {
			cookies.push(cookie);
		},
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
			var template=Utils.getTemplate("500.tmpl");
			this.setStatus(status);
			this.setHeaders({"Content-Type" : "text/html"});
			template = template.replace("<@title>", msg.message);
			template = template.replace("<@message>", msg.message);
			template = template.replace("<@error>", "<pre>" + msg.stack + "</pre>");
			this.getWriter().write(template);
			this.flushBuffer();
		}
	};
};