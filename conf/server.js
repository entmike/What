{
	server : {
		className : "TBD",
		address : "localhost",
		port : 4321,
		shutdown : "SHUTUP"
	},
	services : [
		{
			className : "TBD",
			name : "What Up",
			port : 80,
			engine : {
				backgroundProcessorDelay : 0,
				className : "./Engine.js",
				defaultHost : "localhost",
				name : "My Engine",
				jvmRoute : "TBD",
				hosts : [
					{
						name : "entmike.com",
						appBase : "/var/www",
						className : "./Host.js",
						createDirs : false,
						autoDeploy : false
					},{
						name : "localhost",
						appBase : "websites/defaulthost"
					}
				]
			}
		}
	]
}