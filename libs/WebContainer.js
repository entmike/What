// Required Packages
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var HttpServlet = require('./HttpServlet');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');
var WebApplication = require('./WebApplication');
var Host = require('./Host');
// 3rd Party add-ons
var formidable = require('./formidable');
require('./colors');
var DateFormat = require('./DateFormat');
// Private
var httpServer = null;			// NodeJS HTTP Server
var hosts = [];					// Hosts Collection
var requestLog = []; 			// HTTP Request Logs Collection

var config = {};				// Web Container Configuration
try{ 		// Load Config
	var data = fs.readFileSync("serverConfig.js");
	config = eval("(" + data.toString() + ")");
}catch(e){	// Error
	console.log("Bad or missing serverConfig.js file.  Ending now.".red.bold);
	console.log(e);
	return null;
};
function loadHosts() {
	for(var i=0;i<config.hosts.length;i++) {
		var host = Host.create(config.hosts[i]);
		host.loadWebApps();
		hosts.push(host);
		console.log(("[" + host.getName() + "] loaded.").green);
	}
}
function getHost(hostname) {
	for(var i=0;i<hosts.length;i++) {
		if(hosts[i].getName() == hostname) return hosts[i];
		if(hosts[i].getAliases()) {
			for(var j=0;j<hosts[i].getAliases().length;j++) {
				if(hosts[i].getAliases()[j] == hostname) return hosts[i];
			}
		}
	}
	return null;
}
function getDefaultHost() {
	for(var i=0;i<hosts.length;i++) {
		if(hosts[i].isDefaultHost()) return hosts[i];
	}
}

var listener = function(req, res) {
	// Get Request Host
	var hostName = req.headers.host.split(":")[0];	// Drop Port #
	var host = getHost(hostName);
	if(!host) {
		console.log(hostName + " not found, deferring to default host.");
		host = getDefaultHost();
	}
	host.handle(req, res);
};

exports.create=function(){
	// Public
	return {
		toString : function() {
			return "Web Container";
		},
		start : function() {
			console.log([
				" WW         WW HH      HH     AAA     TTTTTTTT",
				"  WW   W   WW  HH      HH    AA AA       TT   ",
				"   WW WWW WW   HHHHHHHHHH   AAAAAAA      TT   ",
				"    WWW WWW    HH      HH  AA     AA     TT   ",
				"     W   W     HH      HH AA       AA    TT   ",
				"",
				"A Node.JS Web Container."
				].join("\n"));
				loadHosts();
				httpServer = http.createServer(listener);
				httpServer.listen(config.port);
				console.log("Web Container running on:" + config.port);
		}
	};
};