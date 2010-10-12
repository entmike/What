/*
	HTTP Web Container - Mike Howles

	Node.js implementation of a web container.

	Intent to simulate how web containers work, where a requested URI
	can be either executable JavaScript (Serverside, ala ASP/JSP/PHP) or
	actual files in a webroot folder.

*/
var wc = require('./webcontainer');
wc.start();

// Example MIME
var wcSource = wc.createResource({
	rtype : "mime",
	mime : "webcontainer.js"
});
wc.createURI({ uri : "/webcontainer", resource : wcSource });

// Example MIME Cache Clearing Servlet
var cacheServlet = wc.createResource({
	rtype : "servlet",
	persist : true,
	data : {
		times : 0
	},
	handler : function(request) {
		this.container.clearCache();
		this.data.times++;
		return { response : "Cache Cleared " + this.data.times + " times." };
	}
});
wc.createURI({ uri : "/clearcache", resource : cacheServlet });

// Example Error Servlet
var errorServlet = wc.createResource({
	rtype : "servlet",
	persist : false,
	handler : function(request) {
		return { response : a.b.getBogus() }
	}
});
wc.createURI({ uri : "/stats", resource: errorServlet });