/**
 * @author Mike Howles
 */
var fs = require('fs');
var mimeTypes = [
	{ ext : ".323",		mimeType : "text/h323" },
	{ ext : ".3gp",		mimeType : "video/3gpp" },
	{ ext : ".a",		mimeType : "application/octet-stream" },
	{ ext : ".acx",		mimeType : "application/internet-property-stream" },
	{ ext : ".ai",		mimeType : "application/postscript" },
	{ ext : ".aif",		mimeType : "audio/x-aiff" },
	{ ext : ".aifc",	mimeType : "audio/x-aiff" },
	{ ext : ".aiff",	mimeType : "audio/x-aiff" },
	{ ext : ".asc",		mimeType : "application/pgp-signature" },
	{ ext : ".asf",		mimeType : "video/x-ms-asf" },
	{ ext : ".asr",		mimeType : "video/x-ms-asf" },
	{ ext : ".asm",		mimeType : "text/x-asm" },
	{ ext : ".asx",		mimeType : "video/x-ms-asf" },
	{ ext : ".atom",	mimeType : "application/atom+xml" },
	{ ext : ".au",		mimeType : "audio/basic" },
	{ ext : ".avi",		mimeType : "video/x-msvideo" },
	{ ext : ".axs",		mimeType : "application/olescript" },
	{ ext : ".bas",		mimeType : "text/plain" },
	{ ext : ".bat",		mimeType : "application/x-msdownload" },
	{ ext : ".bcpio",	mimeType : "application/x-bcpio" },
	{ ext : ".bin",		mimeType : "application/octet-stream" },
	{ ext : ".bmp",		mimeType : "image/bmp" },
	{ ext : ".bz2",		mimeType : "application/x-bzip2" },
	{ ext : ".c",		mimeType : "text/x-c" },
	{ ext : ".cab",		mimeType : "application/vnd.ms-cab-compressed" },
	{ ext : ".cat",		mimeType : "application/vnd.ms-pkiseccat" },
	{ ext : ".cc",		mimeType : "text/x-c" },
	{ ext : ".cdf",		mimeType : "application/x-netcdf" },
	{ ext : ".cer",		mimeType : "application/x-x509-ca-cert" },
	{ ext : ".cgm",		mimeType : "image/cgm" },
	{ ext : ".chm",		mimeType : "application/vnd.ms-htmlhelp" },
	{ ext : ".class",	mimeType : "application/octet-stream" },
	{ ext : ".clp",		mimeType : "application/x-msclip" },
	{ ext : ".cmx",		mimeType : "image/x-cmx" },
	{ ext : ".cod",		mimeType : "image/cis-cod" },
	{ ext : ".com",		mimeType : "application/x-msdownload" },
	{ ext : ".conf",	mimeType : "text/plain" },
	{ ext : ".cpio",	mimeType : "application/x-cpio" },
	{ ext : ".cpp",		mimeType : "text/x-c" },
	{ ext : ".cpt",		mimeType : "application/mac-compactpro" },
	{ ext : ".crd",		mimeType : "application/x-mscardfile" },
	{ ext : ".crl",		mimeType : "application/pkix-crl" },
	{ ext : ".crt",		mimeType : "application/x-x509-ca-cert" },
	{ ext : ".csh",		mimeType : "application/x-csh" },
	{ ext : ".css",		mimeType : "text/css" },
	{ ext : ".csv",		mimeType : "text/csv" },
	{ ext : ".cxx",		mimeType : "text/x-c" },
	{ ext : ".dcr",		mimeType : "application/x-director" },
	{ ext : ".deb",		mimeType : "application/x-debian-package" },
	{ ext : ".der",		mimeType : "application/x-x509-ca-cert" },
	{ ext : ".diff",	mimeType : "text/x-diff" },
	{ ext : ".dir",		mimeType : "application/x-director" },
	{ ext : ".djv",		mimeType : "image/vnd.djvu" },
	{ ext : ".djvu",	mimeType : "image/vnd.djvu" },
	{ ext : ".dll",		mimeType : "application/x-msdownload" },
	{ ext : ".dmg",		mimeType : "application/octet-stream" },
	{ ext : ".dms",		mimeType : "application/octet-stream" },
	{ ext : ".doc",		mimeType : "application/msword" },
	{ ext : ".dot",		mimeType : "application/msword" },
	{ ext : ".dtd",		mimeType : "application/xml-dtd" },
	{ ext : ".dv",		mimeType : "video/x-dv" },
	{ ext : ".dvi",		mimeType : "application/x-dvi" },
	{ ext : ".dxr",		mimeType : "application/x-director" },
	{ ext : ".ear",		mimeType : "application/java-archive" },
	{ ext : ".eml",		mimeType : "message/rfc822" },
	{ ext : ".eps",		mimeType : "application/postscript" },
	{ ext : ".etx",		mimeType : "text/x-setext" },
	{ ext : ".evy",		mimeType : "application/envoy" },
	{ ext : ".exe",		mimeType : "application/x-msdownload" },
	{ ext : ".ez",		mimeType : "application/andrew-inset" },
	{ ext : ".f",		mimeType : "text/x-fortran" },
	{ ext : ".f77",		mimeType : "text/x-fortran" },
	{ ext : ".f90",		mimeType : "text/x-fortran" },
	{ ext : ".fif",		mimeType : "application/fractals" },
	{ ext : ".flr",		mimeType : "x-world/x-vrml" },
	{ ext : ".flv",		mimeType : "video/x-flv" },
	{ ext : ".for",		mimeType : "text/x-fortran" },
	{ ext : ".gem",		mimeType : "application/octet-stream" },
	{ ext : ".gemspec",	mimeType : "text/x-script.ruby" },
	{ ext : ".gif",		mimeType : "image/gif" },
	{ ext : ".gram",	mimeType : "application/srgs" },
	{ ext : ".grxml",	mimeType : "application/srgs+xml" },
	{ ext : ".gtar",	mimeType : "application/x-gtar" },
	{ ext : ".gz",		mimeType : "application/x-gzip" },
	{ ext : ".h",		mimeType : "text/x-c" },
	{ ext : ".hdf",		mimeType : "application/x-hdf" },
	{ ext : ".hh",		mimeType : "text/x-c" },
	{ ext : ".hlp",		mimeType : "application/winhlp" },
	{ ext : ".hqx",		mimeType : "application/mac-binhex40" },
	{ ext : ".hta",		mimeType : "application/hta" },
	{ ext : ".htc",		mimeType : "text/x-component" },
	{ ext : ".htm",		mimeType : "text/html" },
	{ ext : ".html",	mimeType : "text/html" },
	{ ext : ".htt",		mimeType : "text/webviewhtml" },
	{ ext : ".ice",		mimeType : "x-conference/x-cooltalk" },
	{ ext : ".ico",		mimeType : "image/vnd.microsoft.icon" },
	{ ext : ".ics",		mimeType : "text/calendar" },
	{ ext : ".ief",		mimeType : "image/ief" },
	{ ext : ".ifb",		mimeType : "text/calendar" },
	{ ext : ".iges",	mimeType : "model/iges" },
	{ ext : ".igs",		mimeType : "model/iges" },
	{ ext : ".iii",		mimeType : "application/x-iphone" },
	{ ext : ".ins",		mimeType : "application/x-internet-signup" },
	{ ext : ".isp",		mimeType : "application/x-internet-signup" },
	{ ext : ".iso",		mimeType : "application/octet-stream" },
	{ ext : ".jar",		mimeType : "application/java-archive" },
	{ ext : ".java",	mimeType : "text/x-java-source" },
	{ ext : ".jfif",	mimeType : "image/pipeg" },
	{ ext : ".jnlp",	mimeType : "application/x-java-jnlp-file" },
	{ ext : ".jp2",		mimeType : "image/jp2" },
	{ ext : ".jpe",		mimeType : "image/jpeg" },
	{ ext : ".jpeg",	mimeType : "image/jpeg" },
	{ ext : ".jpg",		mimeType : "image/jpeg" },
	{ ext : ".js",		mimeType : "application/javascript" },
	{ ext : ".json",	mimeType : "application/json" },
	{ ext : ".kar",		mimeType : "audio/midi" },
	{ ext : ".latex",	mimeType : "application/x-latex" },
	{ ext : ".lha",		mimeType : "application/octet-stream" },
	{ ext : ".lsf",		mimeType : "video/x-la-asf" },
	{ ext : ".lsx",		mimeType : "video/x-la-asf" },
	{ ext : ".lzh",		mimeType : "application/octet-stream" },
	{ ext : ".log",		mimeType : "text/plain" },
	{ ext : ".m13",		mimeType : "application/x-msmediaview" },
	{ ext : ".m14",		mimeType : "application/x-msmediaview" },
	{ ext : ".m3u",		mimeType : "audio/x-mpegurl" },
	{ ext : ".m4a",		mimeType : "audio/mp4a-latm" },
	{ ext : ".m4b",		mimeType : "audio/mp4a-latm" },
	{ ext : ".m4p",		mimeType : "audio/mp4a-latm" },
	{ ext : ".m4u",		mimeType : "video/vnd.mpegurl" },
	{ ext : ".m4v",		mimeType : "video/mp4" },
	{ ext : ".mac",		mimeType : "image/x-macpaint" },
	{ ext : ".man",		mimeType : "text/troff" },
	{ ext : ".mathml",	mimeType : "application/mathml+xml" },
	{ ext : ".mbox",	mimeType : "application/mbox" },
	{ ext : ".mdb",		mimeType : "application/x-msaccess" },
	{ ext : ".mdoc",	mimeType : "text/troff" },
	{ ext : ".me",		mimeType : "text/troff" },
	{ ext : ".mesh",	mimeType : "model/mesh" },
	{ ext : ".mht",		mimeType : "message/rfc822" },
	{ ext : ".mhtml",	mimeType : "message/rfc822" },
	{ ext : ".mid",		mimeType : "audio/midi" },
	{ ext : ".midi",	mimeType : "audio/midi" },
	{ ext : ".mif",		mimeType : "application/vnd.mif" },
	{ ext : ".mime",	mimeType : "message/rfc822" },
	{ ext : ".mml",		mimeType : "application/mathml+xml" },
	{ ext : ".mng",		mimeType : "video/x-mng" },
	{ ext : ".mny",		mimeType : "application/x-msmoney" },
	{ ext : ".mov",		mimeType : "video/quicktime" },
	{ ext : ".movie",	mimeType : "video/x-sgi-movie" },
	{ ext : ".mp2",		mimeType : "video/mpeg" },
	{ ext : ".mp3",		mimeType : "audio/mpeg" },
	{ ext : ".mp4",		mimeType : "video/mp4" },
	{ ext : ".mp4v",	mimeType : "video/mp4" },
	{ ext : ".mpa",		mimeType : "video/mpeg" },
	{ ext : ".mpe",		mimeType : "video/mpeg" },
	{ ext : ".mpeg",	mimeType : "video/mpeg" },
	{ ext : ".mpg",		mimeType : "video/mpeg" },
	{ ext : ".mpga",	mimeType : "audio/mpeg" },
	{ ext : ".mpp",		mimeType : "application/vnd.ms-project" },
	{ ext : ".mpv2",	mimeType : "video/mpeg" },
	{ ext : ".ms",		mimeType : "text/troff" },
	{ ext : ".msh",		mimeType : "model/mesh" },
	{ ext : ".msi",		mimeType : "application/x-msdownload" },
	{ ext : ".mvb",		mimeType : "application/x-msmediaview" },
	{ ext : ".mxu",		mimeType : "video/vnd.mpegurl" },
	{ ext : ".nc",		mimeType : "application/x-netcdf" },
	{ ext : ".nws",		mimeType : "message/rfc822" },
	{ ext : ".oda",		mimeType : "application/oda" },
	{ ext : ".odp",		mimeType : "application/vnd.oasis.opendocument.presentation" },
	{ ext : ".ods",		mimeType : "application/vnd.oasis.opendocument.spreadsheet" },
	{ ext : ".odt",		mimeType : "application/vnd.oasis.opendocument.text" },
	{ ext : ".ogg",		mimeType : "application/ogg" },
	{ ext : ".p",		mimeType : "text/x-pascal" },
	{ ext : ".p10",		mimeType : "application/pkcs10" },
	{ ext : ".p12",		mimeType : "application/x-pkcs12" },
	{ ext : ".p7b",		mimeType : "application/x-pkcs7-certificates" },
	{ ext : ".p7c",		mimeType : "application/x-pkcs7-mime" },
	{ ext : ".p7m",		mimeType : "application/x-pkcs7-mime" },
	{ ext : ".p7r",		mimeType : "application/x-pkcs7-certreqresp" },
	{ ext : ".p7s",		mimeType : "application/x-pkcs7-signature" },
	{ ext : ".pas",		mimeType : "text/x-pascal" },
	{ ext : ".pbm",		mimeType : "image/x-portable-bitmap" },
	{ ext : ".pct",		mimeType : "image/pict" },
	{ ext : ".pdb",		mimeType : "chemical/x-pdb" },
	{ ext : ".pdf",		mimeType : "application/pdf" },
	{ ext : ".pem",		mimeType : "application/x-x509-ca-cert" },
	{ ext : ".pfx",		mimeType : "application/x-pkcs12" },
	{ ext : ".pgm",		mimeType : "image/x-portable-graymap" },
	{ ext : ".pgn",		mimeType : "application/x-chess-pgn" },
	{ ext : ".pgp",		mimeType : "application/pgp-encrypted" },
	{ ext : ".pic",		mimeType : "image/pict" },
	{ ext : ".pict",	mimeType : "image/pict" },
	{ ext : ".pkg",		mimeType : "application/octet-stream" },
	{ ext : ".pko",		mimeType : "application/ynd.ms-pkipko" },
	{ ext : ".pl",		mimeType : "text/x-script.perl" },
	{ ext : ".pm",		mimeType : "text/x-script.perl-module" },
	{ ext : ".pma",		mimeType : "application/x-perfmon" },
	{ ext : ".pmc",		mimeType : "application/x-perfmon" },
	{ ext : ".pml",		mimeType : "application/x-perfmon" },
	{ ext : ".pmr",		mimeType : "application/x-perfmon" },
	{ ext : ".pmw",		mimeType : "application/x-perfmon" },
	{ ext : ".png",		mimeType : "image/png" },
	{ ext : ".pnm",		mimeType : "image/x-portable-anymap" },
	{ ext : ".pnt",		mimeType : "image/x-macpaint" },
	{ ext : ".pntg",	mimeType : "image/x-macpaint" },
	{ ext : ".pot",		mimeType : "application/vnd.ms-powerpoint" },
	{ ext : ".ppm",		mimeType : "image/x-portable-pixmap" },
	{ ext : ".pps",		mimeType : "application/vnd.ms-powerpoint" },
	{ ext : ".ppt",		mimeType : "application/vnd.ms-powerpoint" },
	{ ext : ".prf",		mimeType : "application/pics-rules" },
	{ ext : ".ps",		mimeType : "application/postscript" },
	{ ext : ".psd",		mimeType : "image/vnd.adobe.photoshop" },
	{ ext : ".pub",		mimeType : "application/x-mspublisher" },
	{ ext : ".py",		mimeType : "text/x-script.python" },
	{ ext : ".qt",		mimeType : "video/quicktime" },
	{ ext : ".qti",		mimeType : "image/x-quicktime" },
	{ ext : ".qtif",	mimeType : "image/x-quicktime" },
	{ ext : ".ra",		mimeType : "audio/x-pn-realaudio" },
	{ ext : ".rake",	mimeType : "text/x-script.ruby" },
	{ ext : ".ram",		mimeType : "audio/x-pn-realaudio" },
	{ ext : ".rar",		mimeType : "application/x-rar-compressed" },
	{ ext : ".ras",		mimeType : "image/x-cmu-raster" },
	{ ext : ".rb",		mimeType : "text/x-script.ruby" },
	{ ext : ".rdf",		mimeType : "application/rdf+xml" },
	{ ext : ".rgb",		mimeType : "image/x-rgb" },
	{ ext : ".rm",		mimeType : "application/vnd.rn-realmedia" },
	{ ext : ".rmi",		mimeType : "audio/mid" },
	{ ext : ".roff",	mimeType : "text/troff" },
	{ ext : ".rpm",		mimeType : "application/x-redhat-package-manager" },
	{ ext : ".rss",		mimeType : "application/rss+xml" },
	{ ext : ".rtf",		mimeType : "application/rtf" },
	{ ext : ".rtx",		mimeType : "text/richtext" },
	{ ext : ".ru",		mimeType : "text/x-script.ruby" },
	{ ext : ".s",		mimeType : "text/x-asm" },
	{ ext : ".scd",		mimeType : "application/x-msschedule" },
	{ ext : ".sct",		mimeType : "text/scriptlet" },
	{ ext : ".setpay",	mimeType : "application/set-payment-initiation" },
	{ ext : ".setreg",	mimeType : "application/set-registration-initiation" },
	{ ext : ".sgm",		mimeType : "text/sgml" },
	{ ext : ".sgml",	mimeType : "text/sgml" },
	{ ext : ".sh",		mimeType : "application/x-sh" },
	{ ext : ".shar",	mimeType : "application/x-shar" },
	{ ext : ".sig",		mimeType : "application/pgp-signature" },
	{ ext : ".silo",	mimeType : "model/mesh" },
	{ ext : ".sit",		mimeType : "application/x-stuffit" },
	{ ext : ".skd",		mimeType : "application/x-koan" },
	{ ext : ".skm",		mimeType : "application/x-koan" },
	{ ext : ".skp",		mimeType : "application/x-koan" },
	{ ext : ".skt",		mimeType : "application/x-koan" },
	{ ext : ".smi",		mimeType : "application/smil" },
	{ ext : ".smil",	mimeType : "application/smil" },
	{ ext : ".snd",		mimeType : "audio/basic" },
	{ ext : ".so",		mimeType : "application/octet-stream" },
	{ ext : ".spc",		mimeType : "application/x-pkcs7-certificates" },
	{ ext : ".spl",		mimeType : "application/x-futuresplash" },
	{ ext : ".src",		mimeType : "application/x-wais-source" },
	{ ext : ".sst",		mimeType : "application/vnd.ms-pkicertstore" },
	{ ext : ".stl",		mimeType : "application/vnd.ms-pkistl" },
	{ ext : ".stm",		mimeType : "text/html" },
	{ ext : ".sv4cpio",	mimeType : "application/x-sv4cpio" },
	{ ext : ".sv4crc",	mimeType : "application/x-sv4crc" },
	{ ext : ".svg",		mimeType : "image/svg+xml" },
	{ ext : ".svgz",	mimeType : "image/svg+xml" },
	{ ext : ".swf",		mimeType : "application/x-shockwave-flash" },
	{ ext : ".t",		mimeType : "text/troff" },
	{ ext : ".tar",		mimeType : "application/x-tar" },
	{ ext : ".tbz",		mimeType : "application/x-bzip-compressed-tar" },
	{ ext : ".tcl",		mimeType : "application/x-tcl" },
	{ ext : ".tex",		mimeType : "application/x-tex" },
	{ ext : ".texi",	mimeType : "application/x-texinfo" },
	{ ext : ".texinfo",	mimeType : "application/x-texinfo" },
	{ ext : ".text",	mimeType : "text/plain" },
	{ ext : ".tgz",		mimeType : "application/x-compressed" },
	{ ext : ".tif",		mimeType : "image/tiff" },
	{ ext : ".tiff",	mimeType : "image/tiff" },
	{ ext : ".torrent",	mimeType : "application/x-bittorrent" },
	{ ext : ".tr",		mimeType : "text/troff" },
	{ ext : ".trm",		mimeType : "application/x-msterminal" },
	{ ext : ".tsv",		mimeType : "text/tab-seperated-values" },
	{ ext : ".txt",		mimeType : "text/plain" },
	{ ext : ".uls",		mimeType : "text/iuls" },
	{ ext : ".ustar",	mimeType : "application/x-ustar" },
	{ ext : ".vcd",		mimeType : "application/x-cdlink" },
	{ ext : ".vcf",		mimeType : "text/x-vcard" },
	{ ext : ".vcs",		mimeType : "text/x-vcalendar" },
	{ ext : ".vrml",	mimeType : "model/vrml" },
	{ ext : ".vxml",	mimeType : "application/voicexml+xml" },
	{ ext : ".war",		mimeType : "application/java-archive" },
	{ ext : ".wav",		mimeType : "audio/x-wav" },
	{ ext : ".wbmp",	mimeType : "image/vnd.wap.wbmp" },
	{ ext : ".wbxml",	mimeType : "application/vnd.wap.wbxml" },
	{ ext : ".wcm",		mimeType : "application/vnd.ms-works" },
	{ ext : ".wdb",		mimeType : "application/vnd.ms-works" },
	{ ext : ".wks",		mimeType : "application/vnd.ms-works" },
	{ ext : ".wma",		mimeType : "audio/x-ms-wma" },
	{ ext : ".wmf",		mimeType : "application/x-msmetafile" },
	{ ext : ".wml",		mimeType : "text/vnd.wap.wml" },
	{ ext : ".wmls",	mimeType : "text/vnd.wap.wmlscript" },
	{ ext : ".wmlsc",	mimeType : "application/vnd.wap.wmlscriptc" },
	{ ext : ".wmv",		mimeType : "video/x-ms-wmv" },
	{ ext : ".wmx",		mimeType : "video/x-ms-wmx" },
	{ ext : ".wps",		mimeType : "application/vnd.ms-works" },
	{ ext : ".wri",		mimeType : "application/x-mswrite" },
	{ ext : ".wrl",		mimeType : "model/vrml" },
	{ ext : ".wrz",		mimeType : "x-world/x-vrml" },
	{ ext : ".wsdl",	mimeType : "application/wsdl+xml" },
	{ ext : ".xaf",		mimeType : "x-world/x-vrml" },
	{ ext : ".xbm",		mimeType : "image/x-xbitmap" },
	{ ext : ".xht",		mimeType : "application/xhtml+xml" },
	{ ext : ".xhtml",	mimeType : "application/xhtml+xml" },
	{ ext : ".xla",		mimeType : "application/vnd.ms-excel" },
	{ ext : ".xlc",		mimeType : "application/vnd.ms-excel" },
	{ ext : ".xlm",		mimeType : "application/vnd.ms-excel" },
	{ ext : ".xls",		mimeType : "application/vnd.ms-excel" },
	{ ext : ".xlt",		mimeType : "application/vnd.ms-excel" },
	{ ext : ".xml",		mimeType : "application/xml" },
	{ ext : ".xof",		mimeType : "x-world/x-vrml" },
	{ ext : ".xpm",		mimeType : "image/x-xpixmap" },
	{ ext : ".xsl",		mimeType : "application/xml" },
	{ ext : ".xslt",	mimeType : "application/xslt+xml" },
	{ ext : ".xul",		mimeType : "application/vnd.mozilla.xul+xml" },
	{ ext : ".xwd",		mimeType : "image/x-xwindowdump" },
	{ ext : ".xyz",		mimeType : "chemical/x-xyz" },
	{ ext : ".yaml",	mimeType : "text/yaml" },
	{ ext : ".yml",		mimeType : "text/yaml" },
	{ ext : ".z",		mimeType : "application/x-compress" },
	{ ext : ".zip",		mimeType : "application/zip" }
];
/**
 * Get Template from filename in templates/ dir.
 * @param template Template file name
 * @return Template Contents [String]
 */
exports.getTemplate = function(template) {
	var template = fs.readFileSync("templates/" + template).toString();
	return template;
};
/**
 * Get MIME Extension Info
 * @param {String} ext
 * @returns {String} MIME Content-Type
 */
exports.MIMEinfo = function(ext) {
	// Get MIME type for extension
	ext = "." + ext;
	for(var i=0;i<mimeTypes.length;i++) {
		if(mimeTypes[i].ext == ext) return mimeTypes[i];
	}
	return "text/plain";
};
exports.getMIME = function(options) {
	var path = options.path;
	var relPath = options.relPath;
	var callback = options.callback;
	var modSince = options.modSince;
	var scope = options.scope || this;
	var allowDirectoryListing = options.allowDirectoryListing || false;
	// Load MIME Resource and return as object w/some feedback
	var ext;
	// Get file extension
	var dots = path.split(".");
	if(dots.length>0) ext=(dots[dots.length-1]);
	// MIME Object
	var MIME = {};
	fs.stat(path, function(err, stats){
		if(err){ // Not a valid file or directory
			MIME.found = false;
			MIME.status = 404;
			MIME.path = path;
			MIME.mimeType = exports.MIMEinfo("html");
			var template = exports.getTemplate("404.tmpl");
			template = template.replace("<@title>", "404 - Resource Not Found!");
			template = template.replace("<@message>", "The requested resource [" + relPath + "] was not found.");
			MIME.content = template;
			callback.call(scope, MIME);
			return;
		}
		// Valid Directory/File Found.
		if (stats.isDirectory()) {	// DIRECTORY LISTING
			if (path.substring(path.length - 1) != "/") path += "/";
			if (relPath.substring(relPath.length - 1) != "/") relPath += "/";
			MIME.found = true;
			MIME.path = path;
			MIME.folder = true;
			if (allowDirectoryListing) { // To-do: Directory Listing
				MIME.status = 200;
				MIME.mimeType = exports.MIMEinfo("html");
				var template = exports.getTemplate("directoryListing.tmpl");
				MIME.content = template;
				var listing = "<TABLE id=\"listing\"><TR>";
				listing += "<TH>File</TH>";
				listing += "<TH>Date Modified</TH>";
				listing += "</TR>";
				var items = fs.readdirSync(path);
				for (var i = 0; i < items.length; i++) {
					var fPath = MIME.path + items[i];
					var item = fs.statSync(fPath);
					listing += "<TR>";
					listing += "<TD><A href = \"" + relPath + items[i] + "\">" + items[i] + "</A></TD>";
					listing += "<TD>" + item.mtime + "</TD>";
					listing += "</TR>";
				}
				listing += "</TABLE>";
				MIME.content = MIME.content.replace("<@title>", "Directory Listing of: [" + relPath + "]");
				MIME.content = MIME.content.replace("<@header>", "Directory Listing of: [" + relPath + "]");
				MIME.content = MIME.content.replace("<@listing>", listing);
			}
			else {
				MIME.status = 403;
				MIME.mimeType = exports.MIMEinfo("html");
				var template = exports.getTemplate("403.tmpl");
				MIME.content = template;
				MIME.content = MIME.content.replace("<@title>", "Directory Listing not allowed.");
				MIME.content = MIME.content.replace("<@message>", "Directory Listing not allowed.");
			}
			callback.call(scope, MIME);
		}
		if (stats.isFile()) {	// FILE
			var useCache = false;
			if(modSince) {	// Browser passed a mod-since header, let's see if our file is newer...
				var mTime = new Date(stats.mtime);
				var mSince = new Date(modSince);
				var diff = mTime.getTime() - mSince.getTime();
				if(diff<=0) useCache = true;
			}
			if(useCache) {	// MIME should be in browser cache.  Send a not modified 304 response...
				MIME.status=304;
				callback.call(scope, MIME);
			}else{
				fs.readFile(path, function(err, data){
					if (err) {
						MIME.found = false;
						MIME.status = 404;
						MIME.path = path;
						MIME.mimeType = exports.MIMEinfo("html");
						var template = exports.getTemplate("404.tmpl");
						template = template.replace("<@title>", "404 - Resource Not Found!");
						template = template.replace("<@message>", "The requested resource [" + relPath + "] was not found.");
						MIME.content = template;
					}
					else {
						MIME.status = 200;
						MIME.modTime = stats.mtime;
						MIME.found = true;
						MIME.ext = ext;
						MIME.path = path;
						MIME.content = data;
						MIME.mimeType = exports.MIMEinfo(ext);
					}
					callback.call(scope, MIME);
				});
			}
		}
	});
};
exports.MD5 = function (string) {
 
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
 
	x = ConvertToWordArray(string);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toLowerCase();
}