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

    // Popup Handlers
    handleIconClick : function(e) {

	// update the popup with the license information
	var doc_subject = {uri:content.document.location.href};

	// -- title
	this._popup_work_title.value = ccffext.objects.getTitle(
	    content.document, doc_subject);

	// -- attribution link
	this._popup_attribution.value = ccffext.objects.getAuthor(
	    content.document, doc_subject);
	this._popup_attribution.setAttribute(
	    'href', 
	    ccffext.objects.getAuthorUri(content.document, doc_subject).uri
	);

	if (typeof this._popup_attribution.getAttribute("href") == "string") {
	    this._popup_attribution.setAttribute(
		"class", "identity-popup-label text-link");
	} else {
	    this._popup_attribution.setAttribute(
		"class", "identity-popup-label");
	}

	// -- license link
	var license = ccffext.objects.getLicense(
	    content.document, doc_subject, window, RDFA, XH);
	this._popup_license.value = license.name;
	this._popup_license.setAttribute('href', license.uri);

	if (typeof this._popup_license.getAttribute("href") == "string") {
	    this._popup_license.setAttribute(
		"class", "identity-popup-label text-link");
	} else {
	    this._popup_license.setAttribute(
		"class", "identity-popup-label");
	}

	// -- copy and paste HTML
	this._popup_attrib_html.value = license.infoHtml;

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
	    
	    // Hide the location bar icon
	    gCcHandler.hideIcon();
	    
	    const doc = progress.DOMWindow.document;
	    
	    if (doc instanceof HTMLDocument &&
		ccffext.objects.licenseCached(doc))
	    {
		// Show the icon back if the document is cached and contains licensed objects
		gCcHandler.showIcon(doc);
	    }
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
		    if (ccffext.objects.licenseCached(doc)) {
			gCcHandler.showIcon(doc);
		    } else {
			ccffext.objects.parse(doc.location.href,doc,RDFA,XH);
		    }
		}
	    }
	},
	onProgressChange: function() {},
	onStatusChange: function() {},
	onSecurityChange: function() {}
	
    }, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
},false);
