{
	displayName : "Adminstration",
	description : "Web Container Administration",
	contextParams : {
		author : "Mike Howles"
	},
	servlets : [
		{
			name : "getApplications",
			description : "Get Application List",
			servletClass : "getApplications.servlet"
		},{
			name : "getMIMEs",
			description : "Get MIME List",
			servletClass : "getMIMEs.servlet"
		},{
			name : "getEnvironment",
			description : "Get Environment from Server",
			servletClass : "getEnvironment.servlet"
		},{
			name : "stopServer",
			description : "Stop the Web Container",
			servletClass : "stopServer.servlet"
		}
	],
	servletMappings : [
		{
			name : "getApplications",
			urlPattern : "/getApplications"
		},{
			name : "getEnvironment",
			urlPattern : "/getEnvironment"
		},{
			name : "stopServer",
			urlPattern : "/stopServer"
		},{
			name : "getMIMEs",
			urlPattern : "/getMIMEs"
		}
	],
	translations : [
		{ target : "/index.html", source : ["", "/", "index.htm"] }
	]
}