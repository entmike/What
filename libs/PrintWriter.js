exports.PrintWriter = function() {
	var buffer = "";
	var stream;
	// Public
	return {
		toString : function() {
			return "PrintWriter";
		},
		flush : function() {
			if(typeof buffer == "string") {
				stream = new Buffer(buffer);
			}else{
				stream = buffer;
			}
			buffer = "";
		},
		getStream : function() {
			return stream;
		},
		println : function(string) {
			buffer+=string+"\n";
		},
		print : function(string) {
			buffer+=string;
		},
		setStream : function(strm) {
			buffer = strm;
		},
		write : function(string) {
			if(typeof string == "string" || typeof string == "integer") {
				this.print(string);
			}else{
				if(string.toString) {
					this.print(string.toString());
				}else{
					this.print("Object");
				}
			}
		}
	};
};