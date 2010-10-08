var http = require('http');

var server = function(){						// HTTP Server
	// Private
	this.config = {
		port: 80,
		debug : true
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

	// Public
	return {
		config : this.config,
		log : this.log,
		stats : this.stats,
		getListener : function() { return this.httpListener },
		init : function (options) {
			this.httpServer = http.createServer(function(req, res) {
				this.appRef.log(req);
				this.appRef.stats.hits++;
				res.writeHead(200, {
					"Content-Type": "text/html"
				});
				res.end("Hits:" + this.appRef.stats.hits);
			});
			this.httpServer.appRef = this;
			this.httpServer.listen(this.config.port);
			console.log("Server running at http://127.0.0.1:" + this.config.port);
		}	
	}
}();

server.init();