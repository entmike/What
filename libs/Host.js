var fs = require('fs');
var url = require('url');
var gzip = require('./gzip').gzip;

var Utils = require('./Utils');
var Cookie = require('./Cookie');
var WebApplication = require('./WebApplication');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');

exports.create = function(options){
	// Private
	var status = {					// Web Host Status
		startupTime : new Date(),	// Start Time
		running : false,			// Running Flag
		counter: 0,					// Hit Counter
		trace: false				// Trace Mode
	};
	var sessionManager = require('./SessionManager').create({
		timeoutDefault : (3600 * 24 * 365)	// 1 Year
	});
	var dateMask = "mm/dd/yy HH:MM:ss";
	var dateOffset = 1000 * 3600 * 6;
	var options = options || {};
	var name = options.name;
	var allowDirectoryListing = options.allowDirectoryListing || false;
	var defaultHost = options.defaultHost || false;
	var aliases = options.aliases || null;	// Host Name Aliases
	var translations = options.translations || null;	// Path Translations
	var appBase = options.appBase;	// Web Applications Base Directory
	var webapps = [];				// Web Applications Collection
	var contexts = [];				// Application Contexts Collection
	var traces = [];				// Trace Collection
	var adminApp = options.adminApp || null;	// Admin Appname
	function addTrace(options){
		traces.push(options);
	};
	function setTrace(flag) {
		status.trace = flag;
	};
	/**
	* Removes and Reloads and Starts App
	* @param appName Name of Application to restart.
	*/
	var restartApp = function(appName) {
		var webapp = removeApp(appName);
		try {
			loadWebApp(appName);
		}catch(e){
			console.log(e.message.red.bold);
		}
	};
	/**
	* Get WebApp by Name
	* @param name Name of WebApp to retrieve
	* @return WebApp
	*/
	var getWebApp = function(name) {
		// Get WebApp by name
		for(var i=0;i<webapps.length;i++) {
			if(name.indexOf(webapps[i].getName())==0) return webapps[i];
		}
		return null;
	};
	/**
	* Get Contexts Collection
	* 
	* @return context Collection
	*/
	var getContexts = function() {
		return contexts;
	};
	/**
	* Get Context from Contexts Collection
	* @param name of Context to get
	* @return context
	*/
	var getContext = function(name){
		for(var i=0;i<contexts.length;i++) if(contexts[i].path==name) return contexts[i];
	};
	/**
	* Add Context to Contexts Collection
	* @param context Context to add
	*/
	var addContext = function(context) {
		contexts.push(context);
	};
	/**
	* Exposes Safe Private Functions to return object
	*/
	var hostServices = { // Services Available to all Contexts
		getContexts : getContexts, 
		addContext : addContext,
		getContext : getContext
	};
	/**
	* Exposes Administrative Functions to return object
	*/
	var adminServices = { // Services Available to Admin Contexts
		getApplications : function() { return webapps; },
		getWebApp : getWebApp,
		setTrace : setTrace,
		getTraces : function() {
			return traces;
		},
		getSessions : function() {
			return sessionManager.adminServices.getSessions();
		},
		getEnvironment : function() { return process.env; },
		restartApp : restartApp,		
		stopServer : function() { /*Stub*/ }
	};
	/**
	 * Loads Web App from sub-directory in 'webapps'.
	 * @param appName Name of Application to load.
	 */
	var loadWebApp = function(appName) {
		var webJS = appBase + "/webapps/" + appName + "/WEB-INF/web.js";
		try{ // Load Web Config for App
			var data = fs.readFileSync(webJS);
		}catch(e){
			throw new Error("Could not find web.js file in [" + webJS + "].");
		};
		try { // Try to eval the data into a config
			var webConfig = eval("(" + data.toString() + ")");
		}catch(e){
			throw new Error("Problem evaluating web.js");
		};
		var initObj = {
			appName : appName,
			appBase : appBase,
			allowDirectoryListing : allowDirectoryListing,
			webConfig : webConfig,
			containerServices : hostServices,
			adminServices : (adminApp==appName)?adminServices:null
		};
		// Is it an administration servlet, if so, allow access to WebContainer.
		if(adminApp == appName) {
			console.log(("Admin Servlet [" + appName + "] Found.  Assigning Admin Services").green.bold);
		};
		var webApp = WebApplication.create(initObj); // Create Web App
		webapps.push(webApp); // Push WebApp into collection
	};
	/**
	 * Scan Web Container's webapps folder for Applications and Load them
	 */
	var loadWebApps = function() {
		console.log ("Scanning for webapps...".blue.bold);
		try{
			var wa = fs.readdirSync(appBase + "/webapps");
		}catch(e){
			console.log("No 'webapps' directory.  Not loading any webapps.");
			return;
		}
		for(var i=0;i<wa.length;i++) {
			try { 
				loadWebApp(wa[i]); 
				console.log(("Web App [" + wa[i] + "] loaded!").green.bold);
			}
			catch(e){ console.log(e.message.red.bold); }
		}
	};
	/**
	* Removes App From App Collection
	* @param appName Name of Application to restart.
	* @return WebApp
	*/
	var removeApp = function(appName) {
		for(var i=0;i<webapps.length;i++) {
			if(appName.indexOf(webapps[i].getName())==0) {
				var webapp = webapps[i];
				removeContext(appName);
				webapps.splice(i,1);
				return webapp;
			}
		}
	return null;
	};
	/**
	 * Remove Context from contexts Collection
	 * @param context Context to remove
	 */
	var removeContext = function(context) {
		for(var i=0;i<contexts.length;i++) if(contexts[i].path == context) {
			contexts.splice(i,1);
		}
	};
	/**
	 * Get Path Translation for path
	 * @param source Requested Pathname
	 * @return Translated Path, or original if no translations present.
	 */
	var getTranslation = function(source) {
		if(!translations) return null;
		for(var i=0;i<translations.length;i++) {
			var translation = translations[i];
			for(var j=0;j<translation.source.length;j++) if(translation.source[j] == source) {
				// console.log("Translating [" + source + "] to [" + translation.target + "].");
				return translation.target;
			}
		}
		return null;
	};
	var listenerCallback = function(options) {
		// Node.JS listener handler
		// Get Node.JS Request and Response objects
		var req = options.req;
		var res = options.res;
		var formData = options.formData || {};
		req.formData = formData; // Temp
		// Get Start Time of request
		var startMS = new Date().getTime();
		// Create Cookies Collection from Node.JS Header for Servlet Request Constructor
		var cookieHeader = req.headers["cookie"];
		var cookies = [];
		if(cookieHeader){
			var arrCookies = cookieHeader.split(";");
			for(var i=0;i<arrCookies.length;i++) {
				var kv = arrCookies[i].split("=");
				if(kv.length>1) {
					var key = kv[0].replace(/^\s*|\s*$/g,'');	// Trim Whitespace
					var val = kv[1];
					cookies.push(Cookie.create(key, val));
				};
			}
		}
		var JSESSIONID;
		for(var i=0;i<cookies.length;i++) if(cookies[i].getName() == "JSESSIONID") JSESSIONID = cookies[i].getValue();

		// Create HttpServletRequest and HttpServletResponse objects from NodeJS ones.
		var request = new HttpServletRequest.create({
			id : status.counter,		// Tag Request with an ID
			req : req,					// Node.JS Request Obj
			JSESSIONID : JSESSIONID,	// Requested SessionID
			cookies : cookies,			// Cookies Collection
			sessionManager : sessionManager.services
		});
		var response = new HttpServletResponse.create({
			id : status.counter,
			res : res
		});
		status.counter++; // Internal Counter
		if(req.formData && req.formData.files) {
			// Todo: File Handling
		}
		// Get Request URL
		var URL = url.parse(req.url, true);
		var pathName = URL.pathname;
		var redirect = getTranslation(pathName);
		if(redirect) {
			response.sendRedirect(redirect);
			completeResponse(request, response);
			return;
		}
		// pathName = (getTranslation(pathName))?getTranslation(pathName):pathName;
		// Get HTTP Method
		var method = request.getMethod();
		switch (method){
			case "GET" : method = method.green.bold; break;
			case "POST" : method = method.blue.bold; break;
			case "DELETE" : method = method.red.bold; break;
			case "OPTIONS" : method = method.yellow; break;
			case "TRACE" : method = method.yellow.bold; break;
			default : method = method.grey;
		}
		var now = new Date(new Date() - dateOffset);
		console.log("[" + request.getId() + "]\t[" + now.format(dateMask) + "] [" + method + "] [" + request.getRequestURI() + "]");
		// See if there's a WebApp
		var webApp = getWebApp(pathName.substring(1));	// Trim off leading "/"
		if(webApp) { // Web App
			var webAppURL = pathName.substring(webApp.getName().length + 1);  // Slice off webapp portion of URL
			webAppURL = (webApp.getTranslation(webAppURL))?(webApp.getTranslation(webAppURL)):webAppURL;
			webApp.handle({
				URL : webAppURL,
				request : request,
				response : response,
				callback : completeResponse
			});
		}else{ // Not a webapp, try a MIME from webroot -- Need to make a MIME Handler, this is ugly here.
			Utils.getMIME({
				path: appBase + "/webroot" + pathName,
				allowDirectoryListing : allowDirectoryListing,
				relPath : pathName,
				modSince : request.getHeader("If-Modified-Since"),
				cacheControl : request.getHeader("Cache-Control"),
				callback: function(MIME) {
					response.setStatus(MIME.status);
					switch(MIME.status) {
						case 304:	// Cache (Not Changed)
							response.setHeader("Content-Type", "");
						break;
						default:
							response.setHeader("Content-Type", MIME.mimeType.mimeType);
							response.setHeader("Last-Modified", MIME.modTime);
							response.setOutputStream(MIME.content);
					}
					completeResponse(request, response);
				}
			});
		}
	};
	var completeResponse = function(request, response){
		if(request.getHeader("accept-encoding").toLowerCase().indexOf("gzip") > -1) {  // Accepts GZIP
			if(!response.isCommited()) {
				response.setHeader("Content-Encoding", "gzip");
				gzip({
					data : response.getOutputStream(),
					scope : response,
					callback : function(err, data) {
						this.setOutputStream(data);
						this.close();
					}
				});
			}else{ // Response is commited, cannot GZIP.
				response.close();
			}
		}else{ // Browser does not accept GZIP.
			response.close();
		}
		var rStatus = response.getStatus().toString();
		switch (rStatus){
			case "200" : rStatus = rStatus.green; break;
			case "304" : rStatus = rStatus.cyan; break;
			case "404" : rStatus = rStatus.red.bold; break;
			case "302" : rStatus = rStatus.yellow; break;
			case "500" : rStatus = rStatus.red.bold; break;
			default : rStatus = rStatus.grey;
		}
		var now = new Date(new Date() - dateOffset);
		console.log("[" + response.getId() + "]\t[" + now.format(dateMask) + "] [" + rStatus + "] [" + request.getRequestURI() + "]");
		var endMS = new Date().getTime();
		if(status.trace){
			addTrace({
				request : request,
				response : response
			});
		}
	};
	// Public
	return {
		getName : function() {
			return name;
		},
		isDefaultHost : function() {
			return defaultHost;
		},
		getAliases : function() {
			return aliases;
		},
		loadWebApps : loadWebApps,
		handle : function(req, res) {
			// Preprocessing of Node.JS request
			if(req.method=="POST") { // Handle form fields with async formidable addon
				var form = new formidable.IncomingForm();
				form.parse(req, function(err, fields, files) {
					var formData = {
						err : err,
						fields : fields,
						files : files
					};
					listenerCallback({
						req : req,
						res : res,
						formData : formData});
				});
			} else { // Proceed with no post data
				listenerCallback({
					req : req,
					res : res});
			}
		}
	};
}