var PrintWriter = require('./PrintWriter');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');
var Cookie = require('./Cookie');

exports.parseNSP = function(contents) {
	var tags = { start : "<%", writer : "=", global : "!", end : "%>" };
	var start = 0, end = 0, step = 0, cIndex = 0, inScript = false;
	var hits = [], ends = [], newHits = [], steps = [];
	while(start<contents.length && start >-1){	// Find all start tags
		start = contents.indexOf(tags.start, start);
		if(start > -1) {
			hits.push({index:start, tag:"start"});
			start++;
		}
	}
	while(end<contents.length && end >-1){		// Find all end tags
		end = contents.indexOf(tags.end, end);
		if(end > -1) {
			hits.push({index : end, tag :"end"});
			end++;
		}
	}
	hits.sort(function(a, b) {return a.index - b.index;});	// Sort tags
	for(var i = 0;i<hits.length;i++){
		if(hits[i].tag=="start" && !inScript) {
			inScript = true;
			newHits.push({start : hits[i].index});
		}
		if(hits[i].tag=="end" && inScript) {
			inScript = false;
			newHits[step].end = hits[i].index;
			step++;
		}
	}
	for(var i=0;i<newHits.length;i++) {
		// Add leading HTML
		if(cIndex < newHits[i].start) steps.push("writer.write(unescape(\"" + escape(contents.substring(cIndex, newHits[i].start)) + "\"));");
		// Add the code
		steps.push(contents.substring(newHits[i].start+tags.start.length, newHits[i].end));
		// Replace <%= writer shorthand
		if(steps[steps.length-1].indexOf("=") == 0) steps[steps.length-1] = "writer.write(" + steps[steps.length-1].substring(1, steps[steps.length-1].length) + ");";
		cIndex = newHits[i].end+tags.end.length;
	}
	// Add any trailing HTML
	if(cIndex<contents.length) steps.push("writer.write(unescape(" + escape(contents.substring(cIndex, contents.length)) + "));");
	// Add a few implicit variables
	var instructions = [ 
		"(function(request, response, callback){",
		"\n",
		"// Autogenerated JS Servlet Code from NSP\n",
		"// Time Generated: " + new Date() + "\n",
		"response.setHeader(\"Content-Type\", \"text/html\");\n",
		"var writer = response.getWriter();\n",
		"var config = this.getServletConfig();\n",
		"var pageContext = this.getServletContext();\n",
		"var application = this.getServletConfig().getServletContext();\n",	
		steps.join(""),
		"})"
	].join("");
	var doFunction;
	try{
		doFunction = eval(instructions.toString());
	}catch(e){
		doFunction = function(request, response) {
			// Problem initializing Servlet doXXX from NSP Code.
			throw(e);
		}
	}
	// Create servlet options for servlet constructor
	var servletOptions = {
		doGet : { method : doFunction },
		doPost : { method : doFunction },
		doDelete : { method : doFunction },
		doPut : { method : doFunction }
	};
	return servletOptions;	
};

exports.create = function(meta) {
	// Constructor/Private
	var options = meta.options || {};
	var stats = meta.stats || {};
	stats.executions = 0;
	stats.errors = 0;
	var running = false;
	var servletConfig = null;
	// Public
	return {
		toString : function() {
			return "HttpServlet";
		},
		getServletContext : function() {
			return servletConfig.getServletContext();
		},
		getServletConfig : function() {
			return servletConfig;
		},
		init : function(config) {
			if(running) return;
			running = true;
			servletConfig = config;
		},
		log : function(message) {
			/* Writes the specified message to a servlet log file, prepended by the servlet's name.
			*/
			servletConfig.getServletContext().log(
				"[" + servletConfig.getServletName() + "] - " + message
			);
		},
		getLastModified : function(request) {
			/* Returns the time the HttpServletRequest object was last modified, in milliseconds since midnight January 1, 1970 GMT.
			If the time is unknown, this method returns a negative number (the default).
			*/
			return -1;
		},
		doOptions : function(request, response) {
			/* Called by the server (via the service method) to allow a servlet to handle a OPTIONS request. 
			The OPTIONS request determines which HTTP methods the server supports and returns an appropriate header. 
			For example, if a servlet overrides doGet, this method returns the following header:
			Allow: GET, HEAD, TRACE, OPTIONS

			There's no need to override this method unless the servlet implements new HTTP methods, 
			beyond those implemented by HTTP 1.1.
			*/
			var allowHeader = "OPTIONS, TRACE";
			var servletParameters = {};
			if(options.doGet) {
				allowHeader += ", GET";
				if(options.doGet.parameters) servletParameters.doGet = options.doGet.parameters;
			}
			if(options.doPost) {
				allowHeader += ", POST";
				if(options.doGet.parameters) servletParameters.doPost = options.doPost.parameters;
			}
			if(options.doDelete) {
				allowHeader += ", DELETE";
				if(options.doGet.parameters) servletParameters.doGet = options.doDelete.parameters;
			}
			if(options.doPut) {
				allowHeader += ", PUT";
				if(options.doGet.parameters) servletParameters.doGet = options.doPut.parameters;
			}
			response.setHeader("Allow", allowHeader);
			response.setHeader("Servlet-Parameters", JSON.stringify(servletParameters));
		},
		doTrace : function(request, response) {
			/* Called by the server (via the service method) to allow a servlet to handle a TRACE request. 
			A TRACE returns the headers sent with the TRACE request to the client, so that they can be used in debugging.
			There's no need to override this method.
			*/
			response.setHeaders(request.getHeaders());
		},
		service : function(request, response, callback, scope) {
			/* Receives standard HTTP requests from the public service method and dispatches them to the doXXX methods defined
			in this class.  There's no need to override this method.
			*/
			var opts;
			switch (request.getMethod()) {
				case "GET" :
					opts = options.doGet; break;
				case "POST" :
					opts = options.doPost; break;
				case "DELETE" :
					opts = options.doDelete; break;
				case "PUT" :
					opts = options.doPut; break;
				case "OPTIONS" :
					this.doOptions(request, response); this.serviceComplete(request, response);	break;
				case "TRACE" :
					this.doTrace(request, response); this.serviceComplete(request, response); break;
				default:
			}
			if(opts) {
				if(!opts.async) {
					try{ // Execute Servlet Code
						// console.log(opts.method.toString());
						opts.method.call(this, request, response);
						this.serviceComplete(request, response);
					}catch(e){
						response.sendError(500, e);
						stats.errors++;
					}
				}else{	// Asynchronous Call
					try{
						opts.method.call(this, request, response, callback, scope);
					}catch(e){
						response.sendError(500, e);
						stats.errors++;
					}
				}					
			}
			return (opts)?opts.async:false;
		},
		serviceComplete : function(request, response, callback, scope) {
			// See if session exists.  If not, don't make a new one.
			var session = request.getSession(false);
			// Add JSESSIONID cookie if session exists
			if(session) {
				var sessionCookie = Cookie.create("JSESSIONID", session.getId());
				sessionCookie.setMaxAge(session.getMaxInactiveInterval());
				response.addCookie(sessionCookie);
			}
			if(!response.getStatus()) response.setStatus(200);
			stats.executions++;
			// Async Callback
			if(callback) callback.call(scope, request, response);
		}
	};
};