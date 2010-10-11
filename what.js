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
	servlet: {
		persist : false,
		handler : function(request) {
		return { response : a.b.getBogus() }
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
wc.setURI({
	uri : "/clearcache", 
	resource : wc.setResource({
		name : "clearcache",
		servlet : {
			persist : true,
			data : {
				times : 0
			},
			handler : function(request, data) {
				wc.clearCache();
				data.times++;
				return { response : "Cache Cleared " + data.times + " times." };
			}
		}
	})
});