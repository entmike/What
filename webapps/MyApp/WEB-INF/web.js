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
			servletClass : "getEnv.js",
			initParams : {
				key1 : "value"
			}
		},{
			name : "servlet2",
			description : "Servlet 2",
			servletClass : "getStatus.js",
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
	],
	mimeMappings : [
		{ extension : "html" , mimeType : "text/html" },
		{ extension : "htm" , mimeType : "text/html" },
		{ extension : "txt" , mimeType : "text/plain" },
		{ extension : "gif" , mimeType : "image/gif" },
		{ extension : "jpg" , mimeType : "image/jpg" },
		{ extension : "png" , mimeType : "image/png" }
	]
}