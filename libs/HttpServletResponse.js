var Utils = require('./Utils');
var PrintWriter = require('./PrintWriter');
var Cookie = require('./Cookie');

exports.create = function(options) {
	// Private
	var servletOutputStream;
	var commited = false;
	var response = options.res;
	var status = null;
	var contentLength = 0;
	var id = options.id;
	var printWriter = new PrintWriter.create({
		response : response
	});
	var outputStream;
	var headers = {};
	var cookies = [];
	// Public
	return {
		// Non-interface method.  Ends Node.JS response
		close : function() {
			this.flushBuffer();
			if(this.getStatus()==304) {
				this.getWriter().close();
				return;
			}
			if(!servletOutputStream) {
				this.getWriter().close();
			}else{
				response.end(servletOutputStream, "binary");
			}
		},
		getId : function() {
			return id;
		},
		// Standard Interface Methods
		isCommited : function() {
			return commited;
		},
		toString : function() {
			return "HttpServletResponse";
		},
		flushBuffer : function() {
			if(!commited){
				var cookieHeader = "";
				// Serialize since Node won't allow duplicate headers GRRRR...
				for(var i=0;i<cookies.length;i++) cookieHeader+=cookies[i];
				if(cookieHeader != "") this.setHeader("Set-Cookie", cookieHeader);
				response.writeHead(this.getStatus(), this.getHeaders());
				commited = true;
			}
			if(this.getStatus()==304)return;
			if(!servletOutputStream) {
				this.getWriter().flush();
			}else{
				this.getWriter().setStream(servletOutputStream);
			}
		},
		setHeader : function(key, value) {
			if(!commited) {
				headers[key] = value;
			}else{
				console.log("Response already commited.  Cannot write to the header.");
			}
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
			if(!commited) {
				status = s;
			}else{
				console.log("Response already commited.  Cannot write to the header.");
			}
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
			for(var i=0;i<cookies.length;i++){
				if(cookies[i].getName()==cookie.getName() && cookies[i].getPath()==cookie.getPath()) {
					console.log("WARNING: Overwriting Cookie!")
					cookies[i] = cookie;
					return;
				}
			}
			cookies.push(cookie);
		},
		getWriter : function() {
			return printWriter;
		},
		setOutputStream : function(stream) {
			servletOutputStream = stream;
		},
		getOutputStream : function() { 
			if(servletOutputStream) {
				return servletOutputStream;
			}else{
				return printWriter.getStream();
			}
		},
		sendRedirect : function(location) {
			this.setStatus(302);
			this.setHeader("Location", location);
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