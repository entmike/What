var HttpSession = require('./HttpSession');
exports.create = function(options) {
	// Private
	var options = options || {};
	var timeoutDefault = options.timeoutDefault;
	var sessions = [];
	var S4 = function () {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1).toUpperCase();
	};
	var guid = function() {
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};
	// Public
	return {
		getSession : function(SID){
			for(var i=0;i<sessions.length;i++) if(sessions[i].getId()==SID) {
				sessions[i].setLastAccessedTime(new Date);
				sessions[i].setOld();
				return sessions[i];
			}
			return null;
		},
		newSession : function() {
			var session = HttpSession.create({
				id : guid()
			});
			session.setMaxInactiveInterval(timeoutDefault);
			sessions.push(session);
			console.log("New Session Created: [" + session.getId() + "]");
			return session;
		}	
	}
}