exports.create = function(options) {
	// Private
	var attributes = {};
	var creationTime = new Date();
	var lastAccessedTime = new Date();
	var id = options.id;
	var isNew = true;
	// Public
	return {
		// Non-Interface Methods
		setLastAccessedTime : function(date) {
			lastAccessedTime = date;
		},
		setOld : function() {
			isNew = false;
		},
		// Standard Interface Methods
		getAttribute : function(name){
			// Returns the object bound with the specified name in this session, or null if no object is bound under the name.
			return attributes[name];
		},
		getAttributeNames : function() {
			// Returns an Array of String objects containing the names of all the objects bound to this session.
			var names = [];
			for(name in attributes) names.push(name);
			return names;
		},
		getCreationTime : function() {
			// Returns the time when this session was created.
			return creationTime;
		},
		getId : function() {
			// Returns a string containing the unique identifier assigned to this session.
			return id;
		},
		getLastAccessedTime : function() {
			// Returns the last time the client sent a request associated with this session
			return lastAccessedTime;
		},
		getMaxInactiveInterval : function() {
			/* Returns the maximum time interval, in seconds, that the servlet container will keep 
			this session open between client accesses. */
			return maxInactiveInterval;
		},
		invalidate : function() {
			// Invalidates this session and unbinds any objects bound to it.
		},
		isNew : function() {
			// Returns true if the client does not yet know about the session or if the client chooses not to join the session.
			return isNew;
		},
		removeAttribute : function(name) {
			// Removes the object bound with the specified name from this session.
		},
		setAttribute : function(name, value) {
			// Binds an object to this session, using the name specified.
			attributes[name] = value;
		},
		setMaxInactiveInterval : function(interval) {
			/* Specifies the time, in seconds, between client requests before the servlet
			container will invalidate this session. */
			maxInactiveInterval = interval;
		}
	}
}