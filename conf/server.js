{
/**
	server.js - Should be located in conf/server.js
	Based loosely on Tomcat configuration file conf/server.xml
*/
	className : "TBD",
	address : "localhost",
	port : 4321,
	shutdown : "SHUTUP",
	services : [
		{	// Admin Engine Service
			className : "TBD",
			name : "Administration Service",
			port : 81,
			engine : {
				className : "./Engine.js",
				defaultHost : "localhost",
				name : "Admin Engine",
				hosts : [
					{
						name : "localhost",
						appBase : "websites/hostAdmin"						
					}
				]
			}
		},{	// Port 80 General Engine
			className : "TBD",
			name : "You Got Served",
			port : 80,
			engine : {	
				className : "./Engine.js",
				defaultHost : "localhost",
				name : "My Engine",
				hosts : [
					{
						name : "entmike.com",
						aliases : ["www.entmike.com"],
						appBase : "/var/www",
						className : "./Host.js"
					},{
						name : "localhost",
						appBase : "websites/defaulthost",
						mongoPort : 480,
						mongoRest : true
					}
				]
			}
		}
	]
}