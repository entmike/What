var PrintWriter = require('./PrintWriter');
var HttpServletRequest = require('./HttpServletRequest');
var HttpServletResponse = require('./HttpServletResponse');

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
			response.flushBuffer();
		}
	};
}