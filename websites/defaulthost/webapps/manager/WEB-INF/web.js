{
	displayName : "Administration",
	description : "Web Container Administration",
	initParameters : {
		author : "Mike Howles",
        version : "1.1",
		mongoAdmin : {
			user : "admin",
			pass : "admin",
			port : 480
		}
	},
	servlets : [
		{
			name : "newApp",
			description : "Create a New App Context",
			servletClass : "./libs/servlets/adminServlets/newApp.servlet"
		},{
			name : "runCommand",
			description : "Run an OS Command",
			servletClass : "./libs/servlets/adminServlets/runCommand.servlet"
		},{
			name : "getDatabases",
			description : "Get MongoDB Database List",
			servletClass : "./libs/servlets/adminServlets/getDatabases.servlet"
		},{
			name : "getSessions",
			description : "Get Host Sessions",
			servletClass : "./libs/servlets/adminServlets/getSessions.servlet"
		},{
			name : "setTrace",
			description : "Set Trace Status",
			servletClass : "./libs/servlets/adminServlets/setTrace.servlet"
		},{
			name : "getTraces",
			description : "Get Trace Logs",
			servletClass : "./libs/servlets/adminServlets/getTraces.servlet"
		},{
			name : "purgeTraces",
			description : "Purge Trace Logs",
			servletClass : "./libs/servlets/adminServlets/purgeTraces.servlet"
		},{
			name : "getTrace",
			description : "Get Trace Log",
			servletClass : "./libs/servlets/adminServlets/getTrace.servlet"
		},{
			name : "getApplications",
			description : "Get Context List",
			servletClass : "./libs/servlets/adminServlets/getApplications.servlet"
		},{
			name : "getMIMEs",
			description : "Get MIME List",
			servletClass : "./libs/servlets/adminServlets/getMIMEs.servlet"
		},{
			name : "getEnvironment",
			description : "Get Environment from Server",
			servletClass : "./libs/servlets/adminServlets/getEnvironment.servlet"
		},{
			name : "getServletOption",
			description : "Get a Servlet Option",
			servletClass : "./libs/servlets/adminServlets/getServletOption.servlet"
		},{
			name : "restartApp",
			description : "Restart a Web Application",
			servletClass : "./libs/servlets/adminServlets/restartApp.servlet"
		},{
			name : "restartApps",
			description : "Restart all Contexts",
			servletClass : "./libs/servlets/adminServlets/restartApps.servlet"
		},{
			name : "restartServlet",
			description : "Restart a Servlet",
			servletClass : "./libs/servlets/adminServlets/restartServlet.servlet"
		},{
			name : "stopServer",
			description : "Stop the Web Container",
			servletClass : "./libs/servlets/adminServlets/stopServer.servlet"
		},{
			name : "editServlet",
			description : "Edit a Servlet",
			servletClass : "./libs/servlets/adminServlets/editServlet.servlet"
		},{
			name : "default",
			description : "Default MIME Handler Servlet",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : false
			}
		}
	],
	servletMappings : [
		{
			name : "newApp",
			urlPattern : "/newApp"
		},{
			name : "runCommand",
			urlPattern : "/run"
		},{
			name : "getDatabases",
			urlPattern : "/getDatabases"
		},{
			name : "getSessions",
			urlPattern : "/getSessions"
		},{
			name : "setTrace",
			urlPattern : "/setTrace"
		},{
			name : "getTraces",
			urlPattern : "/getTraces"
		},{
			name : "purgeTraces",
			urlPattern : "/purgeTraces"
		},{
			name : "getTrace",
			urlPattern : "/getTrace"
		},{
			name : "getApplications",
			urlPattern : "/getApplications"
		},{
			name : "getEnvironment",
			urlPattern : "/getEnvironment"
		},{
			name : "getServletOption",
			urlPattern : "/getServletOption"
		},{
			name : "stopServer",
			urlPattern : "/stopServer"
		},{
			name : "getMIMEs",
			urlPattern : "/getMIMEs"
		},{
			name : "restartServlet",
			urlPattern : "/restartServlet"
		},{
			name : "restartApp",
			urlPattern : "/restartApp"
		},{
			name : "restartApps",
			urlPattern : "/restartApps"
		},{
			name : "editServlet",
			urlPattern : "/editServlet"
		},{
			name : "default",
			urlPattern : "/"
		}
	],
	translations : [
		{ target : "/index.html", source : ["", "/", "index.htm"] }
	]
}