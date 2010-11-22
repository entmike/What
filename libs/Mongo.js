exports.command = function(options) {
	var scope = options.scope;
	var success = options.success;
	var command = options.command;
	var port = options.port;
	var user = options.user;
	var pass = options.pass;
	if(!success) return;
	failure = options.failure || success;
	
	var chunks = [];
	var mongo = require('child_process').spawn('mongo', 
	['--eval', '"' + command +'"', '--quiet', '--port', port,
	'-u'+user, '-p'+pass]);
	mongo.stdout.on('data', function(data) {
		chunks.push(data.toString());
	});
	mongo.on('exit', function(code) {
		var results = chunks.join("");
			if(code==0){
				success.call(scope, results, code);
			}else{
				failure.call(scope, results, code);
			}
	});
}