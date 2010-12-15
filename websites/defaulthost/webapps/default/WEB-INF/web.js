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
		},{
			name : "syntax",
			description : "Syntax Highlighter 3.0.83 Library",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : true,
				absolutePath : "./libs/fileRepositories/syntaxHighlighter-3.0.83"
			}
		}
	],
	servletMappings : [
		{
			name : "default",
			urlPattern : "/"
		},{
			name : "syntax",
			urlPattern : "/syntax"
		}
	],
	translations : [
		{ target : "index.nsp", source : ["", "/", "/index.htm", "/index.html"] }
	]
}