var EXPORTED_SYMBOLS = ["licenses"];

Components.utils.import("resource://ccffext/ccffext.js");

var licenses = new function Licenses() {

    var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    var license_frame = null, queue = new Array(), working = false, current_callback = null;
    var that = this;

    this.init = function (browser) {

	browser.webNavigation.allowAuth = true;
	browser.webNavigation.allowImages = false;
	browser.webNavigation.allowJavascript = false;
	browser.webNavigation.allowMetaRedirects = true;
	browser.webNavigation.allowPlugins = false;
	browser.webNavigation.allowSubframes = false;
	
	// attach the event listener which will handle parsing licenses
	browser.addEventListener(
	    "DOMContentLoaded", onDomLoaded, true);
	
	// store a reference to the browser
	license_frame = browser;
	
	// reset the internal state flag
	working = false;
				
    }; // init

    this.load = function (license_uri, callback) {
	// refuse to queue something we won't be able to handle
	if ("string" == typeof license_uri) {
	    queue.push([that.normalizeLicenseUri(license_uri), callback]);
	}

	// and check the queue...
	check_queue();

    }; // load

    this.notify = function (timer) {
	check_queue();
    };

    this.normalizeLicenseUri = function (license_uri) {

	if ("string" == typeof license_uri &&
	    license_uri.indexOf("http://creativecommons.org/") == 0) {
	    // This is a Creative Commons license;
	    // make sure we're using the canonical URI
	    if (license_uri.lastIndexOf("/") < license_uri.length - 1) {
		// strip off the trailing bit
		license_uri = license_uri.slice(0, license_uri.lastIndexOf("/") + 1);
	    }
	}

	return license_uri;

    }; // normalizeLicenseUri

    /**
     * Returns information about the license
     *
     * @param license_uri The URI of the license to load
     * @param callback Callback when the license details have been retrieved;
     * @param cb_args An array to be passed into the callback
     * 
     *        This is called with the signature (license, cb_args).
     **/
    this.getLicenseInfo = function(license_uri, callback, cb_args) {

	var license = {
	    name : undefined,
	    uri : undefined,
	    identifier : undefined,
	    code: undefined,
	    color : undefined
	};
	    
	license.uri = license.name = that.normalizeLicenseUri(license_uri);

	if (ccffext.cache.contains(license.uri)) {
	    // this license has already been loaded
	    // retrieve the details from the RDF store
	    populateLicenseObject(license);

	    // call the callback
	    if ("undefined" != typeof callback) {
		callback (license, cb_args);
	    }
	} else 

	// retrieve the license document to introspect for RDFa
	if ("undefined" != typeof license_frame) {

	    // the have a browser reference, retrieve the license
	    that.load(license.uri,
		      function(url) {
			  populateLicenseObject(license);

			  // call the callback when done
			  callback (license, cb_args);
		      });

	} // if a license browser is available
	else 

	    // make sure the call back happens, 
	    // even if we can't load the license
	    if ("undefined" != typeof callback) {
		callback (license, cb_args);
	    }
	    
	return license;

    }; // getLicenseInfo

    function populateLicenseObject(license) {

	license.name = ccffext.objects.getValue(
	    license.uri, {'uri':license.uri}, 
	    ["http://purl.org/dc/terms/title",
	     "http://purl.org/dc/elements/1.1/title"]);
			    
	if ("object" == typeof license.name) 
	    license.name = license.name.toString();
		
	if ("string" == typeof license.name) 
	    license.name = license.name.trim();

	license.identifier = ccffext.objects.getValue(
	    license.uri, {'uri':license.uri},
	    ["http://purl.org/dc/terms/identifier",
	     "http://purl.org/dc/elements/1.1/identifier"]);

	if ("object" == typeof license.identifier) 
	    license.identifier = license.identifier.toString();
		
	if ("string" == typeof license.identifier) 
	    license.identifier = license.identifier.trim();

	if (license.uri.indexOf("http://creativecommons.org/") == 0) {

	    var re_license_code = /http:\/\/creativecommons\.org\/(licenses|publicdomain)\/([a-z\-\+]+)\/.*/;
	    license.code = license.uri.match(re_license_code)[2];
	} else {
	    license.code = license.identifier;
	}

	// determine the license "color"
	// this is currently CC-specific
	switch (license.code) {
	case "by":
	case "by-sa":
	case "mark":
	case "zero":
	case "publicdomain":
	    license.color = "green";
	    break;
	    
	case "by-nc":
	case "by-nd":
	case "by-nc-nd":
	case "by-nc-sa":
	case "sampling+":
	case "nc-sampling+":
	    license.color = "yellow";
	    break;
	    
	case "sampling":
	case "devnations":
	    license.color = "red";
	    break;
	}; // switch on license code
	
    }; // populateLicenseObject

    function onDomLoaded (e) {
	
	var doc = e.originalTarget;
	var url = doc.location.href;
			    
	// parse the license document for RDFa
	ccffext.objects.parse(url, doc);
			    
	// reset flags
	working = false;
	
	// see if there's anything else to process once we're done
	timer.initWithCallback(
	    that,
	    100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

	// call the callback when done
	if ("function" == typeof _current_callback)
	    _current_callback (url);

    }; // onDomLoaded

    var check_queue = function () {

	if (queue.length > 0) {
	    // see if we're currently working
	    if (working == true) {
		timer.initWithCallback(
		    that,
		    100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		return;
	    }

	    // make sure we're initialized
	    if (license_frame === null) {
		timer.initWithCallback(
		    that,
		    250, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		return;
	    };

	    working = true;
	    var license_uri;

	    [license_uri, _current_callback] = queue.pop();
	    license_frame.webNavigation.loadURI(
		license_uri,
		Components.interfaces.nsIWebNavigation, null, null, null);

	}	   

    }; // check_queue

    this.log = function(message)
    {
	Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
	    .logStringMessage(message);
    };
};

