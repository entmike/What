exports.create = function(options) {
	// Private
	var port = options.port;
	var user = options.user;
	var pass = options.pass;
	var db = options.db;
	
	// Public
	return {
		toString : function() {
			return "MongoDB Connector";
		},
		command : function(options) {
			var handler = options.handler;
			var command = options.command || "";
			// Stringify command if needed.
			if(typeof command == 'object') command = JSON.stringify(command);
			// Mongo Child Process
			var execCmd = 'mongo --quiet -u' + user + ' -p' + pass + ' -port ' + port + ' ' + db + ' --eval "' + command + '"';
			// Execute the process
			require('child_process').exec(execCmd, handler);
		}
	}
}