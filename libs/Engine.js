// Required Packages
var http = require('http');
var Host = require('./Host');

require('./colors');			// Colors addon for console coloring
var DateFormat = require('./DateFormat');
// Private
var name = "";					// Engine Name
var port;						// Engine Port
var httpServer = null;			// NodeJS HTTP Server
var hosts = [];					// Hosts Collection
var valves = [];				// Valves in the Pipeline
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
	for(var i=0;i<valves.length;i++){
		valves[i].invoke(req,res);
	}
	if(!req.headers.host) {
		res.writeHead(400, {"Content-Type" : "text/html"});
		res.end("<h1>Bad Request (Invalid or Missing Hostname)</h1>");
		return;
	}
	hostName = req.headers.host.split(":")[0];	// Drop Port #
	var host = getHost(hostName);				// Get Requested Host
	if(!host) host = getDefaultHost();
	host.handle(req, res);
};

// Public
exports.create=function(options){
	port = options.port;
	config = options.config;
	name = config.name;
	var valveConfigs = config.valves || [];
	for(var i=0;i<valveConfigs.length;i++){
		var valveConfig = valveConfigs[i];
		valveConfig.className = valveConfig.className || "./BasicValve.js";
		valveConfig.prefix = valveConfig.prefix || name.replace(" ", "_");
		valveConfig.suffix = valveConfig.suffix || ".txt";
		valveConfig.directory = valveConfig.directory || "logs";
		var valve = require(valveConfig.className).create(valveConfig);
		valve.start();
		valves.push(valve);
	}
	return {
		toString : function() {
			return "[Engine] " + name;
		},
		getName : function() {
			return name;
		},
		start : function() {
				console.log("Web Engine [" + config.name + "] started.");
				loadHosts();
				httpServer = http.createServer(listener);
				httpServer.listen(port);
				console.log("[" + config.name + "] running on:" + port);
		}
	};
};