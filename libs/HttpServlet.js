var PrintWriter = require('./PrintWriter');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');
var ServletContext = require('./ServletContext');
var ServletConfig = require('./ServletConfig');

exports.parseNSP = function(contents) {
	var steps = [];
	var externalSteps = [];
	var tags = { start : "<%", writer : "=", global : "!", end : "%>" }
	var lines = contents.split(new RegExp( "\\n", "g" ));
	var inScript = false;
	var currentScript =[];
	for(var i=0;i<lines.length;i++){	// Loop through raw .nsp content
		var line = lines[i];
		while(line.length>0){ 	// While Loop over a single line until it is parsed out to 0 bytes.
			if(!inScript){		// Outside of Script
				var startIndex = line.indexOf(tags.start);
				if(line.indexOf(tags.start)==-1) {		// Normal Text
					steps.push('writer.write(unescape("' + escape(line + "\n") + '"));\n');
					line="";
				}else{			// Found start of script tag
					var lineBeforeStart = line.substring(0, startIndex);
					steps.push('writer.write(unescape("' + escape(lineBeforeStart) + '"));');
					line = line.substring(startIndex + tags.start.length);
					if(line.length==0) steps.push("\n");
					inScript = true;
				}
			}else{				// Inside Script
				var endIndex = line.indexOf(tags.end);
				if(line.indexOf(tags.end)==-1){			// Line of Script
					currentScript.push(line + "\n");
					line="";
				}else{			// Found end of script tag
					lineBeforeEnd = line.substring(0,endIndex);
					currentScript.push(lineBeforeEnd);
					var theScript = currentScript.join("");			// End of Script Block
					if(theScript.indexOf(tags.writer) === 0){ 		// <%=...%> shorthand
						theScript = "writer.write(" + theScript.substring(tags.writer.length) + ");";
						steps.push(theScript);
					}else if(theScript.indexOf(tags.global) === 0){ // <%!...%> footer
						theScript = theScript.substring(tags.global.length);
						externalSteps.push(theScript);
					}else{
						steps.push(theScript);			// Push Script to Parsed Stack
					}
					currentScript = [];								// Reset Script Stack
					line = line.substring(endIndex+tags.end.length);
					if(line.length==0) steps.push("\n");
					inScript = false;
				}
			}
		}
	}
	// Add a few implicit variables
	var instructions = [ 
		"response.setHeader(\"Content-Type\", \"text/html\");",
		"var writer = response.getWriter();",
		"var config = this.getServletConfig();",
		"var pageContext = this.getServletContext();",
		"var application = this.getServletConfig().getServletContext();",	
		steps.join(""), externalSteps.join("")
	].join("");
	// Create servlet options for servlet constructor
	var servletOptions = {
		doGet : function(request, response) {
			eval(instructions.toString());
		},
		doPost : function(request, response) {
			eval(instructions.toString());
		},
		doDelete : function(request, response) {
			eval(instructions.toString());
		},
		doPut : function(request, response) {
			eval(instructions.toString());
		}
	}
	return servletOptions;	
};

exports.create = function(options) {
	// Constructor/Private
	var options = options || {};
	var running = false;
	var executions = 0;
	var errors = 0;
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
		},
		doTrace : function(request, response) {
			/* Called by the server (via the service method) to allow a servlet to handle a TRACE request. 
			A TRACE returns the headers sent with the TRACE request to the client, so that they can be used in debugging.
			There's no need to override this method.
			*/
			response.setHeaders(request.getHeaders());
		},
		service : function(request, response) {
			/* Receives standard HTTP requests from the public service method and dispatches them to the doXXX methods defined
			in this class.  There's no need to override this method.
			*/
			try{		// Execute Servlet Code
				switch (request.getMethod()) {
					case "GET" :
						options.doGet.call(this, request, response);
						break;
					case "POST" :
						options.doPost.call(this, request, response);
						break;
					case "DELETE" :
						options.doDelete.call(this, request, response);
						break;
					case "PUT" :
						options.doPut.call(this, request, response);
						break;
					case "OPTIONS" :
						this.doOptions(request, response);
						break;
					case "TRACE" :
						this.doTrace(request, response);
						break;
					default:
				}
				response.setStatus(200);
				executions++;
			}catch(e){	// Exeception Handler
				console.log(e);
				response.sendError(500, e);
				errors++;
			}
		}
	};
}