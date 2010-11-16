{
	debug : true,
	port : 81,
	hosts : [
		{
			name : "entmike.com",
			appBase : "websites/defaulthost",
			allowDirectoryListing : true,
			defaultHost : true,	
			aliases : ["www.entmike.com"],
			adminApp : "Admin",
			translations : [
				{ target : "/index.html", source : ["/", "index.htm"] },
				{ target : "/Admin/", source : ["/Admin"] }
			]
		},{
			name : "omgwtflol.com",
			appBase : "websites/omgwtflol.com",
			adminApp : "Admin",
			allowDirectoryListing : false,
			aliases : ["www.omgwtflol.com"],
			translations : [
				{ target : "/Admin/", source : ["/Admin"] }
			]
		}
	]
}