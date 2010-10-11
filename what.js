/*
	HTTP Web Container - Mike Howles

	Node.js implementation of a web container.

	Intent to simulate how web containers work, where a requested URI
	can be either executable JavaScript (Serverside, ala ASP/JSP/PHP) or
	actual files in a webroot folder.

*/
var wc = require('./webcontainer');
wc.start();

// Example Servlet
var exampleServlet = wc.setResource({
	name: "stats",
	servlet: function(request) {
		return {
			response : "Stats Servlet"
		}
	}
});
// Map Servlet to URI
wc.setURI({ uri : "/stats", resource: exampleServlet });

// Example file
wc.setResource({
	name : "webcontainer",
	mime : "webcontainer.js"
});
// Map file to a URI
wc.setURI({ uri : "/webcontainer", resource : wc.getResource("webcontainer")});

// Example MIME Cache Clearing
wc.setURI({ uri : "/clearcache", 
	resource : wc.setResource({
		name : "clearcache",
		servlet : function(request) {
			wc.clearCache();
			return {
				response : "Cache Cleared"
			}
		}
	})
});