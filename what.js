var http = require('http');
var fs = require('fs');

var server = function(){						// HTTP Server
	// Private
	this.getPage = function(uri) {
		for(var i=0;i<this.pages.length;i++) if(this.pages[i].uri == uri) return this.pages[i];
		return null;
	}
	this.getResource = function(name) {
		for(var i=0;i<this.resources.length;i++) if(this.resources[i].name == name) return this.resources[i];
		return null;
	}
	this.displayStats = function(req, res) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end("Hits: " + this.stats.hits);
	}
	this.config = {
		port: 80,
		debug : false
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
		{ name : "favicon", contentType: "image/x-icon", asset: "favicon.ico" }
	];
	this.pages = [
		{ uri: "/favicon.ico", resource : this.getResource("favicon") },
		{ uri: "/", resource : this.getResource("homepage") },
		{ uri: "/index.html", resource : this.getResource("homepage") },
		{ uri: "/index.htm", resource : this.getResource("homepage") },
		{ uri: "/stats.htm", resource : this.getResource("stats") }
	];

	// Public
	return {
		// Expose Private Parts ad Public
		config : this.config,
		pages : this.pages,
		log : this.log,
		stats : this.stats,
		setPage: this.setPage,
		getPage: this.getPage,
		getListener : function() { return this.httpListener },
		// Public Init Method
		init : function (options) {
			this.httpServer = http.createServer(function(req, res) {
				this.appRef.log(req);
				this.appRef.stats.hits++;
				console.log(req.url);
				var page = this.appRef.getPage(req.url);
				if(page) {
					res.writeHead(200, {"Content-Type": page.resource.contentType} || "text/html");
					if(page.resource.controller) page.resource.controller.call(this.appRef, req, res);
					if(page.resource.content) res.end(page.resource.content);
					if(page.resource.asset) {
						fs.readFile(page.resource.asset, function (err, buffer) {
							if (err) { // Handle error
								console.error(err.stack);
								return;
							}
							// Do something
								res.end(buffer);
						});
					}
				} else {
					// 404
				}
			});
			this.httpServer.appRef = this;
			this.httpServer.listen(this.config.port);
			console.log("Server running at http://127.0.0.1:" + this.config.port);
		}	
	}
}();

server.init();