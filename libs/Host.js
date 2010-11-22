var fs = require('fs');
var url = require('url');

var Utils = require('./Utils');
var ServletContext = require('./ServletContext');

var gzip = require('./gzip').gzip;
var formidable = require('./formidable');
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
	var options = options || {};
	var name = options.name;
	var allowDirectoryListing = options.allowDirectoryListing || false;
	var defaultHost = options.defaultHost || false;
	var aliases = options.aliases || null;	// Host Name Aliases
	var translations = options.translations || null;	// Path Translations
	var appBase = options.appBase;	// Contexts Base Directory
	var dbPath = appBase + "/data/db";
	var mongoPort = options.mongoPort || 0;
	var mongoUser = options.mongoUser || "user";
	var mongoPass = options.mongoPass || "pass";
	try{
		var dbTest = fs.readdirSync(dbPath);
		// Instantiate MongoDB
		var mongod = require('child_process').spawn('mongod', ['--dbpath', dbPath, '--port', mongoPort]);
		mongod.stdout.on('data', function(data) {
			console.log(data.toString().cyan);
		});
	}catch(e){
		console.log("No 'data/db' directory.  Not loading MongoDB.".yellow.bold);
	}
	var contexts = [];				// Contexts Collection
	var traces = [];				// Trace Collection
	var adminApp = options.adminApp || null;	// Admin Appname
	function addTrace(options){
		traces.push(options);
	};
	function purgeTraces() {
		traces = [];
	};
	function setTrace(flag) {
		status.trace = flag;
	};
	/**
	* Removes and Reloads and Starts Context
	* @param contextName Name of Context to restart.
	*/
	var restartContext = function(contextName) {
		var context = removeContext(contextName);
		try {
			loadContext(contextName);
		}catch(e){
			console.log(e.message.red.bold);
		}
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
	* @param path of Context to get
	* @return context
	*/
	var getContextByPath = function(path){
		for(var i=0;i<contexts.length;i++){
			if(path.indexOf(contexts[i].getPath())==0){
				return contexts[i];
			}
		}
	};
	var getContextByName = function(contextName){
		for(var i=0;i<contexts.length;i++){
			if(contexts[i].getName()==contextName){
				return contexts[i];
			}
		}
	};
	/**
	* Add Context to Contexts Collection
	* @param context Context to add
	*/
	var addContext = function(context) {
		contexts.push(context);
		contexts.sort(function(a,b){
			return (b.getPath().length - a.getPath().length);
		});
	};
	var addTrace = function(options) {
		if(!status.trace) return;
		traces.push({
			request : options.request,
			response : options.response
		});
	};
	/**
	* Exposes Safe Private Functions/Properties to return object
	*/
	var hostServices = { 
		appBase : appBase,
		getMongoInfo : function(){return {
			port: mongoPort,
			user : mongoUser,
			pass : mongoPass
		}},
		addTrace : addTrace
	};
	/**
	* Exposes Administrative Functions to return object
	*/
	var adminServices = { // Services Available to Admin Contexts
		getContexts : function() { return contexts; },
		getContextByName : getContextByName,
		getContextByPath : getContextByPath,
		setTrace : setTrace,
		purgeTraces : purgeTraces,
		getTraces : function() {
			return traces;
		},
		getSessions : function() {
			return sessionManager.adminServices.getSessions();
		},
		getEnvironment : function() { return process.env; },
		restartContext : restartContext,
		stopServer : function() { /*Stub*/ }
	};
	/**
	 * Loads Context from sub-directory in 'webapps'.
	 * @param path Path of Context to load.
	 */
	var loadContext = function(path) {
		var webINF = appBase + "/webapps/" + path + "/WEB-INF/web.js";
		var metaINF = appBase + "/webapps/" + path + "/META-INF/context.js";
		var webConfig;
		var contextConfig;
		try{ // Load Web Config for Context
			var data = fs.readFileSync(webINF);
		}catch(e){
			throw new Error("Could not find web.js file in [" + webINF + "].");
		};
		try { // Try to eval the data into a config
			webConfig = eval("(" + data.toString() + ")");
		}catch(e){
			throw new Error("Problem evaluating web.js");
		};
		try{ // Look for context.js
			var contextData = fs.readFileSync(metaINF);
			try { // Try to eval the contextData into a contextConfig
				contextConfig = eval("(" + contextData.toString() + ")");
			}catch(e){
				throw new Error("Problem evaluating context.js.  Using Defaults");
			};	
		}catch(e){
			// Use defaults
		};
		contextConfig = contextConfig || {	// Defaults
			name : path,
			path : path
		};
		contextConfig.name = contextConfig.name || path;
		contextConfig.sessionManager = sessionManager;
		contextConfig.appBase = appBase;
		contextConfig.allowDirectoryListing = allowDirectoryListing;
		contextConfig.webConfig = webConfig;
		contextConfig.hostServices = hostServices;
		if(contextConfig.privileged) contextConfig.adminServices = adminServices;
		var context = ServletContext.create(contextConfig);
		context.init();
		contexts.push(context);
		contexts.sort(function(a,b){
			return (b.getPath().length - a.getPath().length);
		});
	};
	/**
	 * Scan Web Container's webapps folder for Applications/Contexts and Load them
	 */
	var loadContexts = function() {
		try{
			var wa = fs.readdirSync(appBase + "/webapps");
		}catch(e){
			console.log("No 'webapps' directory.  Not loading any contexts.".yellow.bold);
			return;
		}
		for(var i=0;i<wa.length;i++) {
			try { 
				loadContext(wa[i]); 
				console.log(("Context [" + wa[i] + "] loaded!").green.bold);
			}
			catch(e){ 
				console.log(e.message.red.bold);
				console.log(e.stack.red);
			}
		}
	};
	/**
	 * Remove Context from contexts Collection
	 * @param context Context to remove
	 */
	var removeContext = function(contextName) {
		for(var i=0;i<contexts.length;i++) if(contexts[i].getName() == contextName) {
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
				return translation.target;
			}
		}
		return null;
	};
	var listenerCallback = function(options) {
		// Node.JS listener handler
		// Get Node.JS Request and Response objects
		status.counter++; 							// Internal Counter
		var startMS = new Date().getTime();			// Start Time of Host Processing
		var req = options.req;						// Node.JS Request Object
		var res = options.res;						// Node.JS Response Object
		var URL = url.parse(req.url, true);			// Get Request URL
		var pathName = URL.pathname;
		var redirect = getTranslation(pathName);
		if(redirect) {
			res.writeHead(301, {"Location" : redirect});
			res.end();
			return;
		}
		var formData = options.formData || {fields : {}};
		req.formData = formData; 					// Temp Rider
		if(req.formData && req.formData.files) {	// Todo: File Handling
			
		}

		// Get HTTP Method
		var method = req.method;
		switch (method){
			case "GET" : method = method.green.bold; break;
			case "POST" : method = method.blue.bold; break;
			case "DELETE" : method = method.red.bold; break;
			case "OPTIONS" : method = method.yellow; break;
			case "TRACE" : method = method.yellow.bold; break;
			default : method = method.grey;
		}
		// See if there's a Context
		var context = getContextByPath(pathName.substring(1));	// Trim off leading "/"
		console.log("[" + status.counter + "]\t[" + method + "] [" + pathName + "]");
		if(context) { // Web App
			console.log("[" + status.counter + "]\tcontext:[" + context.getName()+"]");
			var contextURL = pathName.substring(context.getPath().length + 1);  // Slice off context portion of URL
			contextURL = (context.getTranslation(contextURL))?(context.getTranslation(contextURL)):contextURL;
			context.handle({
				id : status.counter,
				URL : contextURL,
				req : req,
				res : res
			});
		} else {
			res.writeHead(500, {"Content-Type" : "text/plain"});
			res.end("500 - No Context Found.");
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
		loadContexts : loadContexts,
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