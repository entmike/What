/**
	server.js - Should be located in conf/server.js
	Based loosely on Tomcat configuration file conf/server.xml
*/
{	/*
	Represents the entire What Container. It is the single outermost element in the conf/server.js configuration file.
	Its attributes represent the characteristics of the servlet container as a whole.
	*/
	
	// Implementing Class - Does nothing for now.
	className : "TBD",
	// The TCP/IP address on which this server waits for a shutdown command. If no address is specified, localhost is used.
	address : "localhost",
	// The TCP/IP port number on which this server waits for a shutdown command. Set to -1 to disable the shutdown port. 
	port : 4321,
	// The command string that must be received via a TCP/IP connection to the specified port number, in order to shut down What.
	shutdown : "SHUTUP",
	// Services Elements
	services : [
		{
			className : "TBD",
			name : "Administration Service",
			port : 81,
			engine : {
				className : "./Engine.js",
				defaultHost : "localhost",
				name : "Admin Engine",
				hosts : [
					{
						name : "localhost",
						appBase : "websites/hostAdmin"						
					}
				]
			}
		},
		{	/*
			A Service element represents the combination of one or more Connector components that 
			share a single Engine component for processing incoming requests. 
			One or more Service elements may be nested inside a Server element.
			*/
			
			// Implementing Class - Does nothing for now.
			className : "TBD",
			// Display name of service
			name : "You Got Served",
			// Port the service should listen on
			port : 80,
			engine : {	
				/*
				The Engine element represents the entire request processing machinery associated with a particular Service. 
				It receives and processes all requests from the listening port, and returns the completed response to the 
				NodeJS response object for ultimate transmission back to the client.

				Exactly one Engine element MUST be nested inside a Service element, following the port number associated with 
				this Service.
				*/
				// This value represents the delay in seconds between the invocation of method on this engine.  Does nothing yet.
				backgroundProcessorDelay : 0,
				// Java class name of the implementation to use. If not specified, the standard value (./Engine.js) will be used.
				className : "./Engine.js",
				/* The default host name, which identifies the Host that will process requests directed to host names on this server,
				but which are not configured in this configuration file. This name MUST match the name attributes of one of the Host 
				elements nested immediately inside.*/
				defaultHost : "localhost",
				// Logical name of this Engine, for logs.
				name : "My Engine",
				// Stub, no load-balancing used yet.
				jvmRoute : "TBD",
				// Pipeline Valves
				valves : [	// Not ready
					/*{
						className : "./AccessLogValve.js",
						directory : "logs",
						pattern : "common",
						prefix : "",
						resolveHosts : false,
						suffix : "",
						rotatable : false,
						condition : "",
						fileDateFormat : "",
						buffered : true
					}*/
				],
				/* You can nest one or more Host elements inside this Engine element, each representing a different virtual host 
				associated with this server. At least one Host is required, and one of the nested Hosts MUST have a name that 
				matches the name specified for the defaultHost attribute, listed above.	*/
				hosts : [
					{
						/*
						The Host element represents a virtual host, which is an association of a network name for a server 
						(such as "www.mycompany.com" with the particular server on which What is running. 
						In order to be effective, this name must be registered in the Domain Name Service (DNS) server that 
						manages the Internet domain you belong to - contact your Network Administrator for more information.

						In many cases, System Administrators wish to associate more than one network name 
						(such as www.mycompany.com and company.com) with the same virtual host and applications. This can be 
						accomplished using the Host Name Aliases feature discussed below.
						
						One or more Host elements are nested inside an Engine element. Inside the Host element, you can nest 
						Context elements for the web applications associated with this virtual host. 
						
						Exactly one of the Hosts associated with each Engine MUST have a name matching the defaultHost attribute 
						of that Engine.
						*/
						// Network name of this virtual host, as registered in your Domain Name Service server.
						name : "entmike.com",
						// Hostname Alias(es)
						aliases : ["www.entmike.com"],
						/* The Application Base directory for this virtual host. This is the pathname of a directory that may 
						contain web applications to be deployed on this virtual host.*/
						appBase : "/var/www",
						// Javascript class name of the implementation to use.  (Defaults to './Host.js')
						className : "./Host.js",
						// Stub reminder, does nothing yet.
						createDirs : false,
						// Stub reminder, does nothing yet.
						autoDeploy : false
					},{
						name : "localhost",
						appBase : "websites/defaulthost",
						// MongoDB-specific config, probably will move elsewhere, it really doesn't fit here.
						mongoPort : 480,
						mongoRest : true
					}
				]
			}
		}
	]
}