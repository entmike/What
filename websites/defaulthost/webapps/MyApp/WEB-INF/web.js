{
	displayName : "My App",
	description : "Demo Web Container App",
	contextParams : {
		author : "Mike Howles"
	},
	servlets : [
		{
			name : "servlet1",
			description : "Servlet 1",
			servletClass : "getEnv.servlet",
			initParams : {
				key1 : "value"
			}
		}
	],
	servletMappings : [
		{
			name : "servlet1",
			urlPattern : "/getEnv"
		}
	],
	translations : [
		{ target : "/index.nsp", source : ["", "/", "index.htm", "index.html", "default.htm", "default.html"] }
	]
}