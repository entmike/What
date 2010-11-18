// Required Packages
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var Host = require('./Host');

// 3rd Party add-ons
require('./colors');
var DateFormat = require('./DateFormat');
// Private
var httpServer = null;			// NodeJS HTTP Server
var hosts = [];					// Hosts Collection
var requestLog = []; 			// HTTP Request Logs Collection

var config = {};				// Web Container Configuration
try{ 		// Load Config
	var data = fs.readFileSync("conf/hosts.js");
	config = eval("(" + data.toString() + ")");
}catch(e){	// Error
	console.log("Bad or missing conf/hosts.js file.  Ending now.".red.bold);
	console.log(e);
	return null;
};
function loadHosts() {
	for(var i=0;i<config.hosts.length;i++) {
		var host = Host.create(config.hosts[i]);
		host.loadContexts();
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
				"",
				"o          `O  o                 oO ".blue.bold,
				"O           o O                  OO ".blue.bold,
				"o           O o              O   oO ".blue.bold,
				"O           O O             oOo  Oo ".blue.bold,
				"o     o     o OoOo. .oOoO'   o   oO ".blue.bold,
				"O     O     O o   o O   o    O      ".blue.bold,
				"`o   O o   O' o   O o   O    o   Oo ".blue.bold,
				" `OoO' `OoO'  O   o `OoO'o   `oO oO".blue.bold,
				"",
				"A Node.JS Web Container.".green.bold,
				""
				].join("\n"));
				loadHosts();
				httpServer = http.createServer(listener);
				httpServer.listen(config.port);
				console.log("Web Container running on:" + config.port);
		}
	};
};