var fs = require('fs');
var Utils = require('./Utils');

exports.create = function(options) {
	var userFile = options.userFile;
	var users = [];
	var loadUsers = function() {					// Load Users
		if(userFile) {
			var userData = fs.readFileSync(userFile);
			try{
				users = eval("("+ userData.toString() +")");
			}catch(e2){
				console.log(e2.stack.red);
			}
		}
	};
	var saveUsers = function() {					// Save Users
		if(userFile) {
			fs.writeFileSync(userFile, JSON.stringify(users));
		}
	};
	var authenticate = function(user,pass) {		// Authenticate and return user object if valid info
		var u = getUser(user);
		if(u && u.password == Utils.MD5(pass)) return u;
		return null;
	};
	var getUser = function(user) {					// Get User by name
		for(var i=0;i<users.length;i++) if(users[i].username.toLowerCase()==user.toLowerCase()) return users[i];
		return null;
	};
	var authorize = function(user, authorization) {
		
	}
	// Load Users
	loadUsers();
	return {
		loadUsers : loadUsers,
		authenticate : authenticate
	}
}