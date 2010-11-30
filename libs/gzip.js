var spawn = require('child_process').spawn,
	buffer = require('buffer').Buffer;

exports.gzip = function(options) {
	var options = options || {};
	var rate = options.rate || 8,
		enc = options.enc || 'utf8',
		data = options.data || null,
		isBuffer = buffer.isBuffer(options.data),
		callback = options.callback || null;
 
	if (!callback) return;	// Callback function required
	var chunk = [];			// Buffer collection
	// Child process to spawn
	var gzip = spawn('gzip', ['-' + (rate-0),'-c', '-']);
	
	// Determine encoding type
	if (isBuffer) {    
		gzip.stdin.encoding = 'binary';    
		gzip.stdin.end(data.length ? data: '');
	} else {  
		gzip.stdin.end(data ? data.toString() : '', enc);
	}
  
	// GZIP Data listener
	gzip.stdout.on('data', function(data) {
		chunk.push(data);	// Add new Buffer chunk to collection
	});
	
	// GZIP process complete listener
	gzip.on('exit', function(code) {
		var size=0;
		var offset = 0;
		for(var i=0;i<chunk.length;i++) size+=chunk[i].length;	// Count Total Buffer Size
		var output = new buffer(size);							// Create new buffer
		for(var i=0;i<chunk.length;i++){						
			chunk[i].copy(output, offset, 0, chunk[i].length);	// Chunk it all together
			offset+=chunk[i].length;
		}
		callback(code, output);									// Invoke callback function
	});
};