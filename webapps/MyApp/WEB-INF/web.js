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
		},{
			name : "servlet2",
			description : "Servlet 2",
			servletClass : "getStatusx.servlet",
			initParams : {
				key1 : "anotherValue"
			}
		}
	],
	servletMappings : [
		{
			name : "servlet1",
			urlPattern : "/getEnv"
		},{
			name : "servlet2",
			urlPattern : "/getStatus"
		}
	]
}