{
	debug : true,
	port : 80,
	hosts : [
		{
			name : "entmike.com",
			appBase : "/var/www",
			defaultHost : false,	
			aliases : ["www.entmike.com", "localhost"],
			translations : [
				{ target : "/index.html", source : ["/", "index.htm"] }
			]
		},{
			name : "defaulthost",
			appBase : "websites/defaulthost",
			defaultHost : true
		}
	]
}