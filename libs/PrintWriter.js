exports.PrintWriter = function() {
	var stream = null;
	var buffer = "";
	// Public
	return {
		toString : function() {
			return "PrintWriter";
		},
		flush : function() {
			stream = buffer;
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
		write : function(string) {
			this.print(string);
		}
	};
};