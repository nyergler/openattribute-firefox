var EXPORTED_SYMBOLS = ["licenses"];

Components.utils.import("resource://ccffext/ccffext.js");

var licenses = new function Licenses() {

    var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    var license_frame = null, queue = new Array(), working = false, current_callback = null;
    that = this;

    this.init = function (browser) {

	browser.webNavigation.allowAuth = true;
	browser.webNavigation.allowImages = false;
	browser.webNavigation.allowJavascript = false;
	browser.webNavigation.allowMetaRedirects = true;
	browser.webNavigation.allowPlugins = false;
	browser.webNavigation.allowSubframes = false;
	
	// attach the event listener which will handle parsing licenses
	browser.addEventListener(
	    "DOMContentLoaded", _onDomLoaded, true);
	
	// store a reference to the browser
	license_frame = browser;
	
	// reset the internal state flag
	working = false;
				
    } // init

    this.load = function (license_uri, callback) {
	// refuse to queue something we won't be able to handle
	if ("string" == typeof license_uri) {
	    queue.push([license_uri, callback]);
	}

	// and check the queue...
	check_queue();

    } // load

    this.notify = function (timer) {
	check_queue();
    }

    function _onDomLoaded (e) {
	
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

    } // _onDomLoaded

    var check_queue = function () {

	if (queue.length > 0) {
	    // see if we're currently working
	    if (working == true) {
		timer.initWithCallback(
		    that,
		    100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		return;
	    }

	    working = true;
	    var license_uri;

	    [license_uri, _current_callback] = queue.pop();
	    license_frame.webNavigation.loadURI(
		license_uri,
		Components.interfaces.nsIWebNavigation, null, null, null);

	}	   

    } // check_queue

    this.log = function(message)
    {
	Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
	    .logStringMessage(message);
    }
};

