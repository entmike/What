{
	displayName : "Administration",
	description : "Web Container Administration",
	initParameters : {
		author : "Mike Howles",
        version : "1.1"
	},
	servlets : [
		{
			name : "getSessions",
			description : "Get Host Sessions",
			servletClass : "getSessions.servlet"
		},{
			name : "setTrace",
			description : "Set Trace Status",
			servletClass : "setTrace.servlet"
		},{
			name : "getTraces",
			description : "Get Trace Log",
			servletClass : "getTraces.servlet"
		},{
			name : "getApplications",
			description : "Get Context List",
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
			name : "getServletOption",
			description : "Get a Servlet Option",
			servletClass : "getServletOption.servlet"
		},{
			name : "restartApp",
			description : "Restart a Web Application",
			servletClass : "restartApp.servlet"
		},{
			name : "restartApps",
			description : "Restart all Contexts",
			servletClass : "restartApps.servlet"
		},{
			name : "restartServlet",
			description : "Restart a Servlet",
			servletClass : "restartServlet.servlet"
		},{
			name : "stopServer",
			description : "Stop the Web Container",
			servletClass : "stopServer.servlet"
		},{
			name : "editServlet",
			description : "Edit a Servlet",
			servletClass : "editServlet.servlet"
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
			name : "getSessions",
			urlPattern : "/getSessions"
		},{
			name : "setTrace",
			urlPattern : "/setTrace"
		},{
			name : "getTraces",
			urlPattern : "/getTraces"
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