// Required Packages
var http = require('http');
var Host = require('./Host');

require('./colors');			// Colors addon for console coloring
var DateFormat = require('./DateFormat');
// Private
var name = "";					// Engine Name
var httpServer = null;			// NodeJS HTTP Server
var hosts = [];					// Hosts Collection
var config = {};				// Engine Configuration

// Load Hosts from config
function loadHosts() {
	for(var i=0;i<config.hosts.length;i++) {
		var host = Host.create(config.hosts[i]);
		console.log(("Host [" + host.getName() + "] created.").green.bold);
		host.loadContexts();
		hosts.push(host);
	}
}
// Get host by hostname
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
// Get Default Host
function getDefaultHost() {
	return getHost(config.defaultHost);
}

var listener = function(req, res) {
	if(!req.headers.host) {
		res.writeHead(400, {"Content-Type" : "text/html"});
		res.end("<h1>Bad Request (Invalid or Missing Hostname)</h1>");
		return;
	}
	hostName = req.headers.host.split(":")[0];	// Drop Port #
	var host = getHost(hostName);	// Get Requested Host
	if(!host) host = getDefaultHost();
	host.handle(req, res);
};

// Public
exports.create=function(options){
	config = options.config;
	var port = options.port;
	return {
		toString : function() {
			return "Engine";
		},
		start : function() {
				console.log("Web Engine [" + config.name + "] started.");
				loadHosts();
				httpServer = http.createServer(listener);
				/*
				var nodes = require("./multi-node").listen({
					masterListen : false,
					port: port,
					nodes: 4
				}, httpServer);
				*/
				httpServer.listen(port);
				console.log("[" + config.name + "] running on:" + port);
		}
	};
};