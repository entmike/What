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
			name : "getEnvironment",
			description : "Get Environment from Server",
			servletClass : "getEnvironment.servlet"
		}
	],
	servletMappings : [
		{
			name : "getApplications",
			urlPattern : "/getApplications"
		},{
			name : "getEnvironment",
			urlPattern : "/getEnvironment"
		}
	],
	translations : [
		{ target : "/index.html", source : ["", "/", "index.htm"] }
	]
}