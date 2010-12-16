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