// Public
exports.clearCache = function(name) {
	if(!name){
		MIMECache = [];
	}else{
		for(var i=0;i<MIMECache.length;i++) if(MIMECache[i].name == name) return MIMECache[i].pop();
	}
}
exports.getResource = function(name) {
	for(var i=0;i<resources.length;i++) if(resources[i].name == name)return resources[i];
	return null;
}
exports.deleteResource = function(name) {
	for(var i=0;i<resources.length;i++) if(resources[i].name == name)return resources.pop();
	return null;
}
exports.setResource = function(options) {
	if(!options.name) {
		console.log("Warning: No resource name was given.  No resource will be added.");
	}else{
		options.contentType = options.contentType || config.defaults.headers.contentType;
		if(exports.getResource(options.name)) exports.deleteResource(options.name);
		resources.push(options);
		return exports.getResource(options.name);
	}
}
exports.getURI = function(uri) {
	for(var i=0;i<URIs.length;i++) if(URIs[i].uri == uri) return URIs[i];
	return null;
}
exports.setURI = function(options) {
	if(!options.uri) {
		console.log("Warning: No URI path was given.  No URI will be added.");
	}else{
		if(exports.getURI(options.uri)) exports.deleteURI(options.uri);
		URIs.push(options);
		return exports.getURI(options.uri);
	}
}
exports.getPort = function(){
	return config.port;
}
exports.start = function() {
	status.running = true;
	status.startupTime = new Date();
	httpServer = http.createServer(listener);
	httpServer.listen(config.port);
	console.log("Web Container running on:" + config.port);
}
exports.getMIME = function(path, ignoreCache) {
	if(!ignoreCache) {
		for(var i=0;i<MIMECache.length;i++) if(MIMECache[i].path == path) {
			console.log("MIME found in cache");
			return MIMECache[i];
		}
	};
	var MIME = {};
	var data = null;
	try{
		data = fs.readFileSync(path);
		debug.log("Caching MIME: [" + path + "].");
		MIME.found = true;
		MIME.path = path;
		MIME.content = data;
		if(!ignoreCache) MIMECache.push(MIME);
	}catch(e){
		debug.log("MIME not found.");
		debug.log(e);
		MIME.found = false;
		MIME.path = path;
		MIME.content = "Resource [" + path + "] not found.";
	}
	return MIME;
}

// Private
var debug = {
	log : function(msg) {
		if(config.debug) console.log(msg);
	}
}
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');

var httpServer = null;
var listener = function(request, response) {
	status.counter++;
	var objURL = url.parse(request.url, true);
	objURL.pathname = getAlias(objURL.pathname);
	debug.log("Incoming request: [" + objURL.pathname + "]");
	var URI = exports.getURI(objURL.pathname);
	if(!URI) {		// No URI Found.  Try file in webroot.
		debug.log("Unknown URI.  Trying [" + config.webroot + objURL.pathname + "]");
		var MIME = exports.getMIME(config.webroot + objURL.pathname);
		if(MIME.found) {
			response.writeHead(200, {"Content-Type" : {}});
		}else{
			response.writeHead(404, {"Content-Type" : "text/plain"});
		}
		response.end(MIME.content);
	}else{
		if(URI.resource.content) {		// Simple Content
			response.writeHead(200, {"Content-Type" : URI.resource.contentType});
			response.write(URI.resource.content);
			response.end();			
		}else if(URI.resource.mime) {	// MIME Resource
			var MIME = exports.getMIME(URI.resource.mime);
			if(MIME.found) {
				response.writeHead(200, {"Content-Type" : {}});
			}else{
				response.writeHead(404, {"Content-Type" : "text/plain"});
			}
			response.end(MIME.content);			
		}else if(URI.resource.servlet) {	// Servlet
			var results = null;
			try {
				results = (URI.resource.servlet(request));
				response.writeHead(200, {"Content-Type" : results.contentType || URI.resource.contentType});
				response.end(results.response);
			}catch(e) {
				response.writeHead(500, {"Content-Type" : "text/plain"});
				response.end(e.toString());
			}
		}
	}
	//response.end();
	debug.log("Response complete");
};
var config = {
	port : 80,
	debug : true,
	webroot : 'webroot',
	defaults : {
		headers : [
			{ contentType : "text/plain" }
		]
	}
};
var status = {
	startupTime : new Date(),
	running : false,
	counter: 0
};
var resources = [
	{ name : "admin", mime : "admin.html" }
];
var URIs = [
	{ uri : "/admin", resource : exports.getResource("admin") }
];
var transforms = [
	{ uri : "/index.html", aliases : ["/", "/index.htm", "/index.html", "/default.htm", "/default.html" ] }
]
var MIMECache = [];
var requestLog = [];
var getAlias = function(uri) {
	for (var i=0;i<transforms.length;i++) {
		for(var j=0;j<transforms[i].aliases.length;j++) {
			if(transforms[i].aliases[j]==uri) return transforms[i].uri;
		}
	}
	return uri;
}