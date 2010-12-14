{
	displayName : "Default Context",
	description : "Serves Static MIMEs",
	initParameters : {
		author : "Mike Howles",
        version : "1.0"
	},
	servlets : [
		{
			name : "default",
			description : "Default File Handler Servlet",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
					listings : true,
					createSessions : true
			}
		}
	],
	servletMappings : [
		{
			name : "default",
			urlPattern : ""
		}
	],
	translations : [
		{ target : "index.html", source : ["", "/", "/index.htm"] }
	]
}