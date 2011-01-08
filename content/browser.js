var gCcHandler = {

    // Smart Getters
    get _icon () {
	return document.getElementById('ccffext-icon');
    },

    get _popup () {
	return document.getElementById('ccffext-popup');
    },

    get _popup_work_title () {
	return document.getElementById('ccffext-popup-work-title');
    },

    get _popup_attribution () {
	return document.getElementById('ccffext-popup-attribution-link');
    },

    get _popup_license () {
	return document.getElementById('ccffext-popup-license-link');
    },

    get _popup_license_band () {
	return document.getElementById('ccffext-popup-license-band');
    },

    get _popup_attrib_html () {
	return document.getElementById('ccffext-popup-attrib-html');
    },

    get _popup_num_licensed_objects () {
	return document.getElementById('ccffext-popup-licensed-objects');
    },

    get _license_browser () {
	return document.getElementById('ccffext-license-frame');
    },

    resetPopup : function() {
	// hide popup elements which may or may not be shown for this page
	this._popup_license.hidden = true;
	this._popup_work_title.hidden = true;
	this._popup_num_licensed_objects.hidden = true;
	this._popup_attribution.hidden = true;
	this._popup_attrib_html.value = "";		    
	this._popup_attrib_html.hidden = true;
	this._popup_license_band.setAttribute(
	    "class", "band-reset");
    },

    // Popup Handlers
    handleIconClick : function(e) {

	this.resetPopup();

	// update the popup with the license information
	var doc_subject = {uri:content.document.location.href};

	// -- license
	var license = ccffext.objects.getLicense(
	    content.document.location.href, doc_subject);
	var is_doc_licensed = false;

	if ("undefined" != typeof license) {
	    // document is licensed
	    is_doc_licensed = true;

	    this._popup_license.hidden = false;
	    this._popup_license.value = license.uri;
	    this._popup_license.setAttribute('href', license.uri);

	    // ---- get the license details and update the popup when ready
	    licenses.getLicenseInfo(
		ccffext.objects.getLicense(content.document.location.href,
					   doc_subject).uri,
		function(license) {
		    gCcHandler._popup_license.value = license.name;
		    gCcHandler._popup_license_band.setAttribute(
			"class", "band-" + license.color);

		    // -- show the copy and paste HTML
		    // --   this is handled in the callback so we are certain
		    // --   the license document has been dereferenced and
		    // --   parsed
		    gCcHandler._popup_attrib_html.value = 
			ccffext.objects.getAttributionHtml(
			    content.document.location.href, doc_subject);
		    gCcHandler._popup_attrib_html.hidden = false;
		}, []);

	    // -- title
	    this._popup_work_title.hidden = false;
	    this._popup_work_title.value = ccffext.objects.getDisplayTitle(
		content.document.location.href, doc_subject);

	    // -- attribution link
	    let author = ccffext.objects.getAuthor(
		content.document.location.href, doc_subject);
	    let author_uri = ccffext.objects.getAuthorUri(
		content.document.location.href, doc_subject);
	    
	    if ("undefined" != typeof author || 
		"undefined" != typeof author_uri) {
		
		// at least one has been provided
		this._popup_attribution.hidden = false;
		
		if ("undefined" == typeof author && 
		    "undefined" != typeof author_uri)
		    author = author_uri;
		
		if ("undefined" != typeof author) {
		    // attribution name was supplied
		    this._popup_attribution.value = author;
		}
		
		if ("undefined" != typeof author_uri) {
		    this._popup_attribution.setAttribute('href', 
							 author_uri.uri);
		    this._popup_attribution.setAttribute(
			"class", "text-link");
		} else {
		    // no attribution URL
		    this._popup_attribution.setAttribute(
			"class", "");
		}
	    } 
	    
	} // if license is not undefined

	// how many licensed objects described by this page, excluding the page
	var count = ccffext.objects.getLicensedSubjects(
	    content.document.location.href).length - (is_doc_licensed?1:0);
	if (count > 0) {
	    this._popup_num_licensed_objects.value = 
		ccffext.l10n.get("icon.title.label", count);
	    this._popup_num_licensed_objects.hidden = false;
	}

	// show the popup
	this._popup.hidden = false;

	var position = (getComputedStyle(gNavToolbox, "").direction == "rtl") ? 'after_end' : 'after_start';

	this._popup.openPopup(this._icon, position);
    },

    handleMoreInfo : function(e) {
	gCcHandler.hidePopup();
	BrowserPageInfo(null,'ccffext-tab'); 
    },

    hidePopup : function() {
	document.getElementById('ccffext-popup').hidePopup();
    },

    // URL Bar manipulators
    hideIcon : function() {
	this._icon.hidden = true;
    },
    
    showIcon : function(document) {
	const objects = ccffext.objects.getLicensedSubjects(
	    document.location.href);

	this._icon.hidden = false;
	gCcHandler._icon.setAttribute("tooltiptext",
				  ccffext.l10n.get("icon.title.label",
						   objects.length));
    },

    showIconIfLicenseInfo : function(document) {

	// if no document is provided, default to the active document
	if ("undefined" == typeof document) {
	    document = gBrowser.contentDocument;
	}

	// if this is the active document, hide the icon
	if (gBrowser.contentDocument == document)
	    gCcHandler.hideIcon();

	if (document instanceof HTMLDocument) {
	    ccffext.objects.callbackify(
		document, 
		function(document,objects) {
		    if (gBrowser.contentDocument == document) 
			gCcHandler.showIcon(document);
		},
		function(document) {
		    // license not cached
		    ccffext.objects.parse(document.location.href, document);
		});
	}
    }
};

/**
 *  Register window load listener which adds event listeners for tab,
 *  location, and state changes. 
 **/
window.addEventListener("load",function() {

    gBrowser.addEventListener(
	"TabSelect", 
	function(e) { gCcHandler.showIconIfLicenseInfo();}, false);
    gBrowser.tabContainer.addEventListener(
	"TabSelect", 
	function(e) { gCcHandler.showIconIfLicenseInfo();}, false);

    gBrowser.addTabsProgressListener({
	onLocationChange : function(browser, progress,request,uri) {

	    // A tab is opened, closed, or switched to
	    // Show the location bar icon if license information is present

	    // XXX disabling; this is called before the browser fully 
	    // -- loads the document, causing errors in the parse process
	    // gCcHandler.showIconIfLicenseInfo(progress.DOMWindow.document);

	},
	
	onStateChange : function(browser, progress,request,flag,status) {
	    
	    // A document in an existing tab stopped loading
	    if (flag & Components.interfaces.nsIWebProgressListener.STATE_STOP)
	    {
		const doc = progress.DOMWindow.document;
		
		gCcHandler.showIconIfLicenseInfo(progress.DOMWindow.document);
	    }
	},
	
    });

    licenses.init(gCcHandler._license_browser);

},false);
