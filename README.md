WHAT - A Node.JS Web Application Server
===============================================================================
Author : Mike Howles - [entmike@gmail.com](mailto:entmike@gmail.com)

Work in progress Web Container / Application Server written against [Java
specifications and interface of HttpServlets](http://tomcat.apache.org/tomcat-5.5-doc/servletapi/index.html), etc but in JavaScript.

This project began as my first attempt to write *anything* in NodeJS.  I
shortly fell down the rabbit hole of toying with it and what began as a simple
static file server proof-of-concept has now become a Web Application container.

Features
=========
* Configuration files loosely based on Tomcat, but in JSON, not XML.
* Multiple hostname support
* Sessions
* Cookies
* Servlets (using shorthand/lazy JSON notation, see examples)
* Servlet Contexts (AKA Web Apps)
* Static file/MIME serving using a default file handler servlet
* gzip support
* Proper cache response from request headers
* Exception trapping for helpful 500 Server Error pages (most of the time)
* Sample Manager Application, a kind of "Eat your own Dogfood" example application.
* .JSP-like pages, but named as .NSP (NodeJS Server Pages)
* (Very Poor, but existant) MongoDB support (no need to compile a lib!)

Bugs/Things-I-Don\'t-Like/TODO List:
===================================
* DOCUMENTATION/EXAMPLES!  Nobody will even read this without some turn-key examples.
* Struggling with a way to make this multi-threaded.  I\'m not sure how to use a methodology/plugin such as multi-node to make this work with what I now have.  A "bad servlet" can still bring down the whole server.  (e.g. while(true); or some other infinite loop).  I\'d rather delegate the grunt work or each handling servlet to a workerprocess but how do I share Servlet Context between these child processes?  I\'m all ears...
* My implementation has lots of stub/missing code for the Java Interfaces for the various things like HttpServlet, HttpSession, HttpRequest, HttpResponse, ServletContext, ServletConfig, RequestDispatcher, and Cookie.  They are coded enough to do what I\'ve needed them to, but would like to eventually flesh it out as much as is feasible, so that a potential Java Servlet developer would feel a little more at home with the API.  One can dream!
* Better exception handling.  Can never have enough!  I\'ve got error trapping in most places but the project is still very young and much more work to do.
