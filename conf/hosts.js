{
	debug : true,
	port : 80,
	hosts : [
		{
			name : "entmike.com",
			appBase : "websites/defaulthost",
			allowDirectoryListing : true,
			defaultHost : true,	
			aliases : ["www.entmike.com"],
			adminApp : "manager",
			translations : [
				{ target : "/index.html", source : ["/", "index.htm"] },
				{ target : "/Admin/", source : ["/Admin"] }
			]
		}/*,{
			name : "omgwtflol.com",
			appBase : "websites/omgwtflol.com",
			adminApp : "manager",
			allowDirectoryListing : false,
			aliases : ["www.omgwtflol.com"],
			translations : [
				{ target : "/manager/", source : ["/manager"] }
			]
		}*/
	]
}