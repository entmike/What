exports.create = function(name, value) {
	/*
	Constructs a cookie with a specified name and value.
	The name must conform to RFC 2109. That means it can contain only ASCII alphanumeric characters and cannot contain 
	commas, semicolons, or white space or begin with a $ character. The cookie's name cannot be changed after creation.
	
	The value can be anything the server chooses to send. Its value is probably of interest only to the server. 
	The cookie's value can be changed after creation with the setValue method.

	By default, cookies are created according to the Netscape cookie specification. The version can be changed with the 
	setVersion method.
	*/
	// Private
	var name = name;
	var value = value;
	var comment = "";
	var domain;
	var maxAge = -1;
	var path = "";
	var secure = false;
	var version = 1;
	// Public
	return {
		clone : function(){
			// Return a copy of this cookie. - Stub
		},
		getComment : function() {
			// Returns the comment describing the purpose of this cookie, or null if the cookie has no comment.
			return comment;
		},
		getDomain : function() {
			// Returns the domain name set for this cookie.
			return domain;
		},
		getMaxAge : function() {
			/* Returns the maximum age of the cookie, specified in seconds, 
			By default, -1 indicating the cookie will persist until browser shutdown. */
			return maxAge;
		},
		getName : function() {
			// Returns the name of the cookie.
			return name;
		},
		getPath : function() {
			// Returns the path on the server to which the browser returns this cookie.
			return path;
		},
		getSecure : function() {
			/* Returns true if the browser is sending cookies only over a secure protocol, 
			or false if the browser can send cookies using any protocol. */
			return secure;
		},
		getValue : function() {
			// Returns the value of the cookie.
			return value;
		},
		getVersion : function() {
			// Returns the version of the protocol this cookie complies with.
			return version;
		},
		setComment : function(purpose) {
			// Specifies a comment that describes a cookie's purpose.
			comment = purpose;
		},
		setDomain : function(pattern) {
			// Specifies the domain within which this cookie should be presented.
			domain = pattern;
		},
		setMaxAge : function(expiry) {
			// Sets the maximum age of the cookie in seconds.
			maxAge = expiry;
		},
		setPath : function(uri) {
			// Specifies a path for the cookie to which the client should return the cookie.
			path = uri;
		},
		setSecure : function(flag) {
			// Indicates to the browser whether the cookie should only be sent using a secure protocol, such as HTTPS or SSL.
			secure = flag;
		},
		setValue : function(newValue) {
			// Assigns a new value to a cookie after the cookie is created.
			value = newValue;
		},
		setVersion : function(v) {
			// Sets the version of the cookie protocol this cookie complies with.
			version = v;
		}
	}
}