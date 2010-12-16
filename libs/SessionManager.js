var HttpSession = require('./HttpSession');
exports.create = function(options) {
	// Private
	var options = options || {};
	var timeoutDefault = options.timeoutDefault;
	var domain = options.domain || "";
	var sessions = [];
	var getSessions = function() {
		options.getSessions.call(this);
	};
	var S4 = function () {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1).toUpperCase();
	};
	var guid = function() {
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};
	// Public
	return {
		adminServices : {	// Exposed to WebContainer
			getSessions : function() {
				return sessions;
			}
		},
		services : {	// Exposed to HttpServletRequest
			getSession : function(sig){
				for(var i=0;i<sessions.length;i++) {
					if(sessions[i].getId()==sig.id) {	// Session requested found
						// Check request signature vs session signature requested
						var ses = sessions[i];
						var sesSig = ses.getFingerPrint();
						var resolution = 0;		// Signature Resolution
						var matches = 0;		// Match Count
						for(s in sesSig) {
							resolution++;		// Increment Resolution counter based on signature properties
							if(sesSig[s]==sig[s]) matches ++;	// Match, increase matches counter
						}
						var accuracy = matches/resolution;	// Determine Signature Accuracy %
						if(accuracy > .8){		// If Signature is 80% accurate, return it
							sessions[i].setLastFingerPrint(sig);
							sessions[i].setLastAccessedTime(new Date);
							sessions[i].setOld();
							return sessions[i];
						}
					}
				}
				return null;
			},
			isValid : function(sid) {
				// Check to see if passes JSESSIONID is valid
				for(var i=0;i<sessions.length;i++) if(sessions[i].getId()==sid) return true
				return false
			},
			newSession : function(signature) {
				signature = signature || {};
				signature.id = guid();			// Generate UID
				var session = HttpSession.create(signature);
				session.setMaxInactiveInterval(timeoutDefault);
				sessions.push(session);
				console.log("New Session Created: [" + session.getId() + "]");
				return session;
			}
		}
	}
}