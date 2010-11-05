{
	displayName : "Adminstration",
	description : "Web Container Administration",
	contextParams : {
		author : "Mike Howles",
        version : "1.0"
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
			name : "getServletOption",
			description : "Get Servlet Option",
			servletClass : "getServletOption.servlet"
		},{
			name : "restartApp",
			description : "Restart a WebApp - Requires: (webApp)",
			servletClass : "restartApp.servlet"
		},{
			name : "restartApps",
			description : "Restart all WebApps",
			servletClass : "restartApps.servlet"
		},{
			name : "restartServlet",
			description : "Restart a Servlet - Requires: (webApp, servlet)",
			servletClass : "restartServlet.servlet"
		},{
			name : "stopServer",
			description : "Stop the Web Container",
			servletClass : "stopServer.servlet"
		},{
			name : "editServlet",
			description : "Edit a Servlet - Requires: (webApp, servlet)",
			servletClass : "editServlet.servlet"
		},
	],
	servletMappings : [
		{
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
		}
	],
	translations : [
		{ target : "/index.html", source : ["", "/", "index.htm"] }
	]
}