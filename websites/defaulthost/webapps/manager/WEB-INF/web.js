{
	displayName : "Manager",
	description : "Web Engine Manager",
	initParameters : {
		author : "Mike Howles",
        version : "1.3",
		mongoAdmin : {
			user : "admin",
			pass : "admin",
			port : 480
		}
	},
	loginConfig : {
		requireAuthentication : true,
		loginServlet : "Login Servlet",
		loginMessage : "<b>Manager Login</b><br/>Enter your User ID and Password.<br/>Use admin/nimda for now.",
        exceptionPolicy : "whitelist",
        exceptions : [
            "Sencha Touch Library", "ExtJS Library", "CSS and JS Resources"
        ]
	},
	servlets : [
		{
			name : "Login Servlet",
			description : "Standard Login Servlet",
			servletClass : "./libs/servlets/login.servlet"
		},{
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
		},{
			name : "ExtJS Library",
			description : "ExtJS 3.3.0 Library",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : false,
				absolutePath : "./libs/fileRepositories/ext-3.3.0"
			}
		},{
			name : "Sencha Touch Library",
			description : "Sencha Touch 1.0.1a Library",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : false,
				absolutePath : "./libs/fileRepositories/sencha-touch-1.0.1a"
			}
		},{
			name : "ExtJS Addons",
			description : "ExtJS Addons",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : false,
				absolutePath : "./libs/fileRepositories/ext-addons"
			}
		},{
			name : "Syntax Highlighter",
			description : "Syntax Highlighter 3.0.83 Library",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : false,
				absolutePath : "./libs/fileRepositories/syntaxHighlighter-3.0.83"
			}
		},{
			name : "CSS and JS Resources",
			description : "CSS and JS Resources",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : false,
				absolutePath : "./libs/fileRepositories/resources"
			}
		},{
			name : "Root Directory",
			description : "Root Directory of OS",
			servletClass : "./libs/servlets/fileHandler.servlet",
			initParams : {
				listings : true,
				absolutePath : "/"
			}
		}
	],
	servletMappings : [
		{
			name : "Login Servlet",
			urlPattern : "/login"
		},{
			name : "Root Directory",
			urlPattern : "/root"
		},{
			name : "CSS and JS Resources",
			urlPattern : "/resources"
		},{
			name : "ExtJS Library",
			urlPattern : "/ext-3.3.0"
		},{
			name : "Sencha Touch Library",
			urlPattern : "/sencha-touch-1.0.1a"
		},{
			name : "ExtJS Addons",
			urlPattern : "/ext-addons"
		},{
			name : "Syntax Highlighter",
			urlPattern : "/syntaxHighlighter-3.0.83"
		},{
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
		{ target : "index.nsp", source : ["", "/", "/index.htm"] }
	]
}