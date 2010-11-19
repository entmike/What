var fs = require('fs');
var http = require('http');
var url = require('url');

console.log([                                                 
	"",
	"o          `O  o                 oO ",
	"O           o O                  OO ",
	"o           O o              O   oO ",
	"O           O O             oOo  Oo ",
	"o     o     o OoOo. .oOoO'   o   oO ",
	"O     O     O o   o O   o    O      ",
	"`o   O o   O' o   O o   O    o   Oo ",
	" `OoO' `OoO'  O   o `OoO'o   `oO oO",
	"",
	"A Node.JS Web Container.",
	""
	].join("\n"));

try{ 		// Load Config
	var data = fs.readFileSync("conf/server.js");
	serverConfig = eval("(" + data.toString() + ")");
}catch(e){	// Error
	console.log("Bad or missing conf/server.js file.  Ending now.");
	console.log(e);
	return null;
};

var server = serverConfig.server || {};

server.address = server.address || "localhost";
server.port = server.port || "4321";
server.shutdown = server.shutdown || "SHUTUP";

var services = serverConfig.services;

var shutdownServer = http.createServer(function(req, res) {
	// Get Request Host
	var hostName = req.headers.host;
	if(hostName == server.address + ":" + server.port) {
		var pathname = url.parse(req.url, true).pathname;
		if(pathname.indexOf(server.shutdown) == 1) {
			console.log("Received SHUTDOWN Signal.  Shutting down...");
			res.writeHead(200, {"Content-Type" : "text/plain"});
			res.end("Shutdown Signal Accepted.");
			process.exit(0);
		}else{
			res.writeHead(404, {"Content-Type" : ""});
			res.end("");
		}
	}
});
shutdownServer.listen(server.port);

for(var i=0;i<services.length;i++) {
	service = services[i];
	var engine = require(service.engine.className || "./Engine.js").create({
		port : service.port,
		config : service.engine
	});
	engine.start();
}