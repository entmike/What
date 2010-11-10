exports.create = function(res) {
	// Private

	// Public
	return {
		getAttribute : function(name){
			// Returns the object bound with the specified name in this session, or null if no object is bound under the name.
		},
		getAttributeNames : function() {
			// Returns an Array of String objects containing the names of all the objects bound to this session.
		},
		getCreationTime : function() {
			// Returns the time when this session was created.
		},
		getId : function() {
			// Returns a string containing the unique identifier assigned to this session.
		},
		getLastAccessedTime : function() {
			// Returns the last time the client sent a request associated with this session
		},
		getMaxInactiveInterval : function() {
			/* Returns the maximum time interval, in seconds, that the servlet container will keep 
			this session open between client accesses. */
		},
		invalidate : function() {
			// Invalidates this session and unbinds any objects bound to it.
		},
		isNew : function() {
			// Returns true if the client does not yet know about the session or if the client chooses not to join the session.
		},
		removeAttribute : function(name) {
			// Removes the object bound with the specified name from this session.
		},
		setAttribute : function(name, value) {
			// Binds an object to this session, using the name specified.
		},
		setMaxInactiveInterval : function(interval) {
			/* Specifies the time, in seconds, between client requests before the servlet
			container will invalidate this session. */
		}
	}
}