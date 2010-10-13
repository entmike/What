var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');

// Public
exports.clearCache = function(name) {
	if(!name){
		MIMECache = [];
	}else{
		for(var i=0;i<MIMECache.length;i++) if(MIMECache[i].name == name) return MIMECache[i].pop();
	}
}
exports.getResourceByName = function(name) {
	for(var i=0;i<resources.length;i++) if(resources[i].name == name)return resources[i];
	return null;
}

exports.getURI = function(uri) {
	for(var i=0;i<URIs.length;i++) if(URIs[i].uri == uri) return URIs[i];
	return null;
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
	// State Listener/Thread
	setInterval(saveState, config.saveStateInterval);
}
exports.getMIME = function(path, ignoreCache) {
	var ext;
	var dots = path.split(".");
	if(dots.length>0) ext=(dots[dots.length-1]);
	if(!ignoreCache) {
		for(var i=0;i<MIMECache.length;i++) if(MIMECache[i].path == path) {
			debug.log("MIME found in cache");
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
		if (ext=="nsp") {
			var nsp = MIME.content.toString();
			var buffer = {
				buffer : [],
				write : function(text){
					this.buffer.push(text);
				},
				writeEscapedText :function(text){
					this.buffer.push(unescape(text));
					console.log(text);
				}
			};
			var toEval = NSPParser(nsp);
			
			try{
				eval("(" + toEval + ")");
			}catch(e){
				debug.log(toEval);
				debug.log(e.toString());
			}
			MIME.content = buffer.buffer;
		}
		// if(!ignoreCache) MIMECache.push(MIME);
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
		switch(URI.resource.rtype) {
			case "simple" :
				response.writeHead(200, {"Content-Type" : URI.resource.contentType});
				response.end(URI.resource.content);
				break;
			case "mime" :
				var MIME = exports.getMIME(URI.resource.mime);
				if(MIME.found) {
					response.writeHead(200, {"Content-Type" : {}});
				}else{
					response.writeHead(404, {"Content-Type" : "text/plain"});
				};
				response.end(MIME.content);
				break;
			case "servlet" :						// Servlet Resource
				try {
					results = URI.resource.handler.call(URI.resource, request);
					response.writeHead(200, {"Content-Type" : results.contentType || URI.resource.contentType});
					response.end(results.response);
				}catch(e){
					response.writeHead(500, {"Content-Type" : "text/plain"});
					response.end(e.toString());
				}
				break;
			default :								// Unknown Resource Type
				response.writeHead(200, {"Content-Type" : "text/plain" });
				response.end(JSON.stringify(URI.resource));
		};
	}
	debug.log("Response complete");
};
var saveState = function () {
	if(status.savingState) return;
	status.savingState = true;
	for(var i=0;i<resources.length;i++) {
		var res = resources[i];
		if( res.rtype=="servlet" && res.data && res.persist && res.dataDirty) {
			var dataObj = {
				timeStamp: new Date(),
				servletData : res.data
			};
			fs.writeFileSync(res.name + "_servletState", JSON.stringify(dataObj));
			res.dataDirty = false;
		}
	}
	status.savingState = false;
}
var config = {
	port : 80,
	debug : true,
	saveStateInterval : 5000,
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
exports.getStatus = function() {
	return status;
}
exports.createURI = function(options) {
	if(!options.uri) {
		console.log("Warning: No URI path was given.  No URI will be added.");
	}else{
		if(exports.getURI(options.uri)) exports.deleteURI(options.uri);
		URIs.push(options);
		return exports.getURI(options.uri);
	}	
}
exports.loadResource = function(options) {
	var resource;
	try{
		var data = eval("("+fs.readFileSync(options.file).toString()+")");
		resource = exports.createResource(data);
	}catch(e){
		debug.log(e);
	}
	return resource;
}
exports.createResource = function(options) {
	// Global Properties
	var resourcePrivate = {
		running : true
	};
	var returnResource = {
		rtype : options.rtype || "simple",
		name : options.name || "res" + ++resourceCounter
	};
	switch(returnResource.rtype) {
		case "simple" :			// Simple Resource
			returnResource.content = options.content;
			break;
			
		case "mime" :			// MIME Resource
			returnResource.mime = options.mime;
			break;
			
		case "servlet" :		// Servlet Resource
			returnResource.running = true;
			returnResource.executions = 0;
			returnResource.contentType = options.contentType || "text/plain";
			returnResource.container = this;
			returnResource.stop = function() {
				this.running = false;
			}
			returnResource.handler = function(request){
				var results = options.handler.call(returnResource, request);
				this.executions++;
				this.dataDirty = true;
				return results;
			};
			returnResource.data = options.data || {};
			returnResource.persist = options.persist || false;
			if (returnResource.persist) try {
				var pd = fs.readFileSync(returnResource.name + "_servletState").toString();
				var persistData = eval("("+pd+")");
				for (el in persistData.servletData) {
					returnResource.data[el] = persistData.servletData[el];
				}
				debug.log("[" + returnResource.name + "] state restored (." + persistData.timeStamp + ")");
			}catch(e){
				debug.log("No prior servlet state found.");
			}
			returnResource.dataDirty = false;
			returnResource.setData = function(key, value) {
				this.data[key] = value;
				this.dataDirty = true;
			};
		default :
			break;
	}
	debug.log(returnResource.name + " created.");
	resources.push(returnResource);
	return returnResource;
};
exports.getResources = function() {
	return resources;
}
var resourceCounter = 0;
var sharedData = [];
var resources = [];
var URIs = [];
var transforms = [
	{ uri : "/index.html", aliases : ["/", "/index.htm", "/index.html", "/default.htm", "/default.html" ] }
];

var getEnv = exports.loadResource({file : "adminServlets/getEnv.txt"});
var getServerStatus = exports.loadResource({file: "adminServlets/getServerStatus.txt"});
var getServlets = exports.loadResource({file: "adminServlets/getServlets.txt"});

exports.createURI({ uri : "/getEnv", resource : getEnv });
exports.createURI({ uri: "/getServerStatus", resource : getServerStatus });
exports.createURI({ uri : "/getServlets", resource : getServlets });

/*
"begin"                 : "<?",
"write" 				 : "=",
"global" 				 : "!",					     
"end"                   : "?>",
*/

function NSPParser(contents){
	var parsedTextArray = [];
	var externalParsedTextArray = [];
	var startTag = "<%";
	var startWriteAddition = "=";
	var startGlobalAddition = "!";
	var endTag = "%>";
	var lineArray = contents.split(new RegExp( "\\n", "g" ));
	var isInScript = false;
	var currentScript =[];
	var nextLine = "\n";
	for(var i=0;i<lineArray.length;i++){
		line = lineArray[i];			
		while(line.length>0){
			if(!isInScript){
				var startTagIndex = line.indexOf(startTag);
				if(line.indexOf(startTag)==-1){
					parsedTextArray.push('buffer.writeEscapedText("'+escape(line+nextLine)+'");'+nextLine);
					line="";
				}
				else{
					lineBeforeStart = line.substring(0,startTagIndex);
					parsedTextArray.push('buffer.writeEscapedText("'+escape(lineBeforeStart)+'");');
					line = line.substring(startTagIndex+startTag.length);
					if(line.length==0) parsedTextArray.push(nextLine);
					isInScript = true;
				}
			}
			else{// In Script
				var endTagIndex = line.indexOf(endTag);
				if(line.indexOf(endTag)==-1){
					currentScript.push(line + nextLine);
					line="";
				}
				else{
					lineBeforeEnd = line.substring(0,endTagIndex);
					currentScript.push(lineBeforeEnd);
					var theScript = currentScript.join("");
					if(theScript.indexOf(startWriteAddition) === 0){ //handling <?=...?> cases
						theScript = "buffer.write("+theScript.substring(startWriteAddition.length)+");";
						parsedTextArray.push(theScript);
					}else if(theScript.indexOf(startGlobalAddition) === 0){ //handling <?!...?> cases
						theScript = theScript.substring(startGlobalAddition.length);
						externalParsedTextArray.push(theScript);
					}else{
						parsedTextArray.push(theScript);
					}
					currentScript = [];
					line = line.substring(endTagIndex+endTag.length);
					if(line.length==0)
						parsedTextArray.push(nextLine);
					isInScript = false;
				}
			}
		}
	}
	var finalFunction = [
		parsedTextArray.join(""),
		externalParsedTextArray.join("")
	].join("");
	return finalFunction;
};

