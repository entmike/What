exports.create = function(options) {
	var response = options.response;	// Node.JS Response Object
	var stringBuffer = "";
	// Public
	return {
		toString : function() {
			return "PrintWriter";
		},
		flush : function() {
			response.write(stringBuffer);
			stringBuffer = "";
		},
		close : function() {
			response.end();
		},
		getStream : function() {
			return stringBuffer;
		},
		setStream : function(strm) {
			buffer = strm;
		},
		write : function(input) {
			if(typeof input == "string" || typeof input == "integer") {
				stringBuffer += input
			}else{
				if(input.toString) {
					stringBuffer += input.toString();
				}else{
					stringBuffer += "[Object]";
				}
			}
		}
	};
};