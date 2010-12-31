var EXPORTED_SYMBOLS = ["licenseloader"];

Components.utils.import("resource://ccffext/ccffext.js");

var licenseloader = {
    timer : Components.classes["@mozilla.org/timer;1"]
        .createInstance(Components.interfaces.nsITimer),
    license_frame : null,
    queue : new Array(),
    working : false,
    _current_callback : null,

    init : function (license_frame) {

	if (this.license_frame == null) {
	    // if (!license_frame.hasAttribute("ccffext_configured")) {
	    license_frame.webNavigation.allowAuth = true;
	    license_frame.webNavigation.allowImages = false;
	    license_frame.webNavigation.allowJavascript = false;
	    license_frame.webNavigation.allowMetaRedirects = true;
	    license_frame.webNavigation.allowPlugins = false;
	    license_frame.webNavigation.allowSubframes = false;
	    
	    license_frame.addEventListener(
		"DOMContentLoaded", this._onDomLoaded, true);
	    licenseloader.license_frame = license_frame;
	    // license_frame.setAttribute("ccffext_configured", "true");
	}
				
    }, // init

    load_license : function (license_uri, callback) {
	licenseloader.queue.push([license_uri, callback]);
	licenseloader._check_queue();
    }, // load_license

    _onDomLoaded : function (e) {
	
	var doc = e.originalTarget;
	var url = doc.location.href;
			    
	// parse the license document for RDFa
	ccffext.objects.parse(url, doc);
			    
	// reset flags
	licenseloader.working = false;
	
	// see if there's anything else to process once we're done
	licenseloader.timer.initWithCallback(
	    licenseloader,
	    100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

	// call the callback when done
	licenseloader._current_callback (url);

    }, // _onDomLoaded

    notify : function (timer) {
	licenseloader._check_queue();
    },

    _check_queue : function () {

	if (licenseloader.queue.length > 0) {
	    // see if we're currently working
	    if (licenseloader.working == true) {
		licenseloader.timer.initWithCallback(
		    licenseloader,
		    100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		return;
	    }

	    // assert licenseloader.working == false;

	    licenseloader.working = true;
	    var license_uri;

	    [license_uri, licenseloader._current_callback] = licenseloader.queue.pop();
	    licenseloader.license_frame.webNavigation.loadURI(
		license_uri,
		Components.interfaces.nsIWebNavigation, null, null, null);

	}	   

    }, // _check_queue

  log : function(message)
    {
	Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
	    .logStringMessage(message);
    }
};

