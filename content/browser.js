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

    get _popup_attrib_html () {
	return document.getElementById('ccffext-popup-attrib-html');
    },

    resetPopup : function() {
	// hide popup elements which may or may not be shown for this page
	this._popup_license.hidden = true;
	this._popup_work_title.hidden = true;
	this._popup_attribution.hidden = true;
	this._popup_attrib_html.value = "";		    
	this._popup_attrib_html.hidden = true;
    },

    // Popup Handlers
    handleIconClick : function(e) {

	this.resetPopup();

	// update the popup with the license information
	var doc_subject = {uri:content.document.location.href};

	// -- license link
	var license = ccffext.objects.getLicense(content.document, doc_subject);

	if ("undefined" != typeof license) {
	    this._popup_license.hidden = false;
	    this._popup_license.value = license.uri;
	    this._popup_license.setAttribute('href', license.uri);

	    // ---- get the license details and update the popup when ready
	    ccffext.objects.getLicenseDetails(
		content.document, doc_subject,
		function(document, object, license) {
		    gCcHandler._popup_license.value = license.name;
		});

	    // -- title
	    this._popup_work_title.hidden = false;
	    this._popup_work_title.value = ccffext.objects.getTitle(
		content.document, doc_subject);

	    // -- attribution link
	    let author = ccffext.objects.getAuthor(content.document, doc_subject);
	    let author_uri = ccffext.objects.getAuthorUri(content.document, doc_subject);
	    
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
		    this._popup_attribution.setAttribute('href', author_uri.uri);
		    this._popup_attribution.setAttribute(
			"class", "identity-popup-label text-link");
		} else {
		    // no attribution URL
		    this._popup_attribution.setAttribute(
			"class", "identity-popup-label");
		}
	    } 

	    // -- copy and paste HTML
	    ccffext.objects.getAttributionHtml(
		content.document, doc_subject,
		function(document, object, attrib_html) {
		    if (attrib_html) {
			gCcHandler._popup_attrib_html.value = attrib_html;
			gCcHandler._popup_attrib_html.hidden = false;
		    } 
		});
	    
	}; // if license is not undefined

	// show the popup
	this._popup.hidden = false;

	var position = (getComputedStyle(gNavToolbox, "").direction == "rtl") ? 'after_end' : 'after_start';

	this._popup.openPopup(this._icon, position);
    },

    handleMoreInfo : function(e) {
	BrowserPageInfo(null,'ccffext-tab'); 
    },

    hidePopup : function() {
	// document.getElementById('ccffext-popup').hidePopup();
    },

    // URL Bar manipulators
    hideIcon : function() {
	this._icon.hidden = true;
    },
    
    showIcon : function(document) {
	const objects = ccffext.objects.extract(document);
	this._icon.hidden = false;
	gCcHandler._icon.setAttribute("tooltiptext",
				  ccffext.l10n.get("icon.title.label",
						   objects.length));
    },

    showIconIfLicensed : function(document) {
	if (document instanceof HTMLDocument &&
	    ccffext.objects.licenseCached(document))
	{
	    // Show the icon back if the document is cached and contains licensed objects
	    this.showIcon(document);
	} else {
	    this.hideIcon();
	}
    }

};

/**
* Register a page load listener that would look for licensing
* information on pages properly responding for it. Gathered
* information is cached for performance reasons		 
**/
window.addEventListener("load",function() {
    gBrowser.addProgressListener({
	onLocationChange : function(progress,request,uri) {
	    // A tab is opened, closed, or switched to

	    // Show the location bar icon if license information is present
	    gCcHandler.showIconIfLicensed(progress.DOMWindow.document);
	},
	
	onStateChange : function(progress,request,flag,status) {
	    
	    // A document in an existing tab stopped loading
	    if (flag & Components.interfaces.nsIWebProgressListener.STATE_STOP)
	    {
		const doc = progress.DOMWindow.document;
		
		if (doc instanceof HTMLDocument) 
		{
		    // Parse the information and put it to cache.
		    // Show the icon back if the document contains licensed objects
		    ccffext.objects.callbackify(
			doc,
			function(doc) {
			    // license cached
			    gCcHandler.showIcon(doc);
			},
			function(doc) {
			    // license not cached
			    ccffext.objects.parse(doc.location.href, doc,
						  RDFA, XH);
			});

		}
	    }
	},
	onProgressChange: function() {},
	onStatusChange: function() {},
	onSecurityChange: function() {}
	
    }, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
},false);
