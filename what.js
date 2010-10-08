/*
	HTTP Server - Mike Howles

	Node.js implementation of a more robust web server.

	Intent to simulate how web containers work, where a requested URI
	can be either executable JavaScript (Serverside, ala ASP/JSP/PHP) or
	actual files in a webroot.

*/

var http = require('http');
var fs = require('fs');

// HTTP Server
var server = function(){ 
	// Private --- I've got scope problems though, will clean up this hacky code maybe.
	this.getPage = function(uri) {
		for(var i=0;i<this.pages.length;i++) if(this.pages[i].uri == uri) return this.pages[i];
		return null;
	}
	this.getResource = function(name) {
		for(var i=0;i<this.resources.length;i++) if(this.resources[i].name == name) return this.resources[i];
		return null;
	}
	this.displayStats = function(req, res) {
		res.end("Hits: " + this.stats.hits);
	}
	this.badJS = function(req, res) {
		// To-do: Crashy JS to simulate a 500 Server Error.
	}
	this.config = {
		port: 80,
		debug : false, 
		webroot : "webroot",
	};
	this.stats = {
		uptime : new Date(),
		hits : 0
	};
	this.requestLog = [];
	this.httpServer = null;
	this.log = function(req) {
		requestLog.push(req);
		if(this.config.debug) console.log(req);
	};
	this.resources = [
		{ name : "homepage" , content: "My Home Page", controller: null },
		{ name : "stats", content : null, controller: this.displayStats },
		{ name : "badJS", content : null, controller: this.makeError },
		{ name : "favicon", contentType: "image/x-icon", asset: "favicon.ico" }
	];
	this.pages = [
		{ uri: "/favicon.ico", resource : this.getResource("favicon") },
		{ uri: "/", resource : this.getResource("homepage") },
		{ uri: "/index.html", resource : this.getResource("homepage") },
		{ uri: "/index.htm", resource : this.getResource("homepage") },
		{ uri: "/stats.htm", resource : this.getResource("stats") },
		{ uri: "/badJS.htm", resource : this.getResource("badJS") }
	];

	// Public --- I've got scope problems though, will clean up this hacky code maybe.
	return {
		// Expose Private Parts as Public, this is probably not the right way
		config : this.config,
		pages : this.pages,
		log : this.log,
		stats : this.stats,
		setPage: this.setPage,
		getPage: this.getPage,
		// Public Init Method
		init : function (options) {
			this.httpServer = http.createServer(function(req, res) {
				this.appRef.log(req);
				this.appRef.stats.hits++;
				console.log(req.url);
				var page = this.appRef.getPage(req.url);
				if(page) {	// Page occurs somewhere in our list
					// Straight up content
					if(page.resource.content) res.end(page.resource.content);
					// Controller = Server-Side JS Execution
					if(page.resource.controller) {
						try {
							res.writeHead(200, {"Content-Type": page.resource.contentType} || "text/html");
							page.resource.controller.call(this.appRef, req, res);
						} catch(e) {
							console.log("500 Error");	// Can't seem to catch an error yet
							res.writeHead(500, {"Content-Type": page.resource.contentType} || "text/html");
							res.end("WTF 500 :(");
						}
					}
					// Actual file asset in webroot
					if(page.resource.asset) {
						fs.readFile(page.resource.asset, function (err, data) {
							if (err) { // Handle error
								console.error(err.stack);
								return;
							}
							res.writeHead(200, {"Content-Type": page.resource.contentType} || "text/html");
							res.end(data);
						});
					}
				} else {	// No entry -- Possibly a real asset in webroot
					fs.readFile(this.appRef.config.webroot + req.url, function (err, data) {
						if (err) { // Handle error
							console.error(err.stack);
							res.writeHead(404, {"Content-Type" : "text/html"});
							res.end("404!");
							return;
						}else{
							res.writeHead(200, {});	// To-do: Got to figure out how to get MIME types.
							res.end(data);
						}
					});
				}
			});
			this.httpServer.appRef = this;
			this.httpServer.listen(this.config.port);
			console.log("Server running at http://127.0.0.1:" + this.config.port);
		}	
	}
}();

server.init();