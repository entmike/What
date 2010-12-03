var fs = require("fs");
var logBuffer = [];
var directory;
var prefix;
var suffix;
var resolveHosts;
var rotatable;
var pattern;
var logName = "access_log";
var enabled = false;
var checkExists = false;
var buffered = false;
var logFile = null;
var intervalID = null;
var commonPattern = "%h %l %u %t \"%r\" %s %b";
var combinedPattern = "%h %l %u %t \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\""

exports.create = function(options) {
	directory = options.directory;
	if(directory.length>0) if(directory[directory.length-1]!="/") directory += "/";
	prefix = options.prefix;
	suffix = options.suffix;
	buffered = options.buffered;
	resolveHosts = options.resolveHosts;
	rotatable = options.rotatable;
	pattern = options.pattern;
	return {
		start : function() {
			if(!enabled) {
				enabled = true;
				this.open();
				if(this.isBuffered()) {
					intervalID = setInterval(this.writeBuffer, 1000);
				}
			}
		},
		stop : function() {
			enabled = false;
			if(intervalID) {
				clearTimeout(intervalID);
				this.writeBuffer();
			}
			logFile.end();
		},
		open : function() {
			logFile = fs.createWriteStream(directory + this.getFileName(), {'flags': 'a'});
			// console.log(logFile);
		},
		getEnabled : function(){
			return enabled;
		},
		setEnabled : function(flag) {
			enabled = flag;
		},
		getDirectory : function() {
			return directory;
		},
		getFileName : function() {
			return prefix + logName + suffix;
		},
		setDirectory : function(dir) {
			directory = dir;
			if(directory.length>0) if(directory[directory.length-1]!="/") directory += "/";
		},
		getInfo : function() {
			return "AccessLogValve based loosely on Tomcat Interface";
		},
		getPattern : function() {
			return pattern;
		},
		setPattern : function(pat) {
			pattern = pat;
		},
		isCheckExists : function() {
			return checkExists;
		},
		setCheckExists : function(flag) {
			checkExists = flag;
		},
		getPrefix : function() {
			return prefix;
		},
		setPrefix : function(pfx) {
			prefix = pfx;
		},
		getSuffix : function() {
			return suffix;
		},
		setSuffix : function(sfx) {
			suffix = sfx;
		},
		isRotatable : function() {
			return rotatable;
		},
		setRotatable : function(flag) {
			rotatable = flag;
		},
		isBuffered : function() {
			return buffered;
		},
		setBuffered : function(flag) {
			buffered = flag;
		},
		invoke : function(req, res){
			/*
			%a - Remote IP address
			%A - Local IP address
			%b - Bytes sent, excluding HTTP headers, or '-' if no bytes were sent
			%B - Bytes sent, excluding HTTP headers
			%h - Remote host name
			%H - Request protocol
			%l - Remote logical username from identd (always returns '-')
			%m - Request method
			%p - Local port
			%q - Query string (prepended with a '?' if it exists, otherwise an empty string
			%r - First line of the request
			%s - HTTP status code of the response
			%S - User session ID
			%t - Date and time, in Common Log Format format
			%u - Remote user that was authenticated
			%U - Requested URL path
			%v - Local server name
			%D - Time taken to process the request, in millis
			%T - Time taken to process the request, in seconds
			%I - current Request thread name (can compare later with stacktraces)
			*/
			var pat = pattern;
			if(pat == "common") pat = commonPattern;
			if(pat == "combined") pat = combinedPattern;
			/*var logValues = {
				remoteIP : 
				localIP :
				bytesSent : 
				bytesSentWithHeaders : 
				remoteHostName : 
				requestProtocol : 
				remoteLogicalUsername : "-",
				method : request.method,
				port : 
				queryString :
				requestLine :
				status :
				sessionID : 
				timeStamp : 
				auth :
				url :
				serverName :
				procTime :
				thread : /*pid
			}*/
			/*
			req.on("end", function(){
				console.log(res.connection._onOutgoingSent.toString());
			});
			*/
			
			this.log(req.connection.remoteAddress);
		},
		rotate : function() {
		
		},
		log : function(message) {
			logBuffer.push(message);
			if(!this.isBuffered()) this.writeBuffer();
		},
		writeBuffer : function() {
			if(logBuffer.length==0) return;
			logFile.write(logBuffer.join("\n")+"\n");
			logBuffer = [];
		}		
	}
}