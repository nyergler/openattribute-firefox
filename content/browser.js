/**
 * Main extension object.
 *
 * Behaves as a namespace for all code, containing configuration and references to objects and routines
 */
var ccffext =
{
	/**
	 * Configuration
	 */
	config :
	{
		/**
		 * Logging enabled.
		 *
		 * If set to true, then {@link ccffext.log} function is allowed to output debugging messages to the console
		 */
		loggingEnabled : true,

		/**
		 * The identifier of the special tab in the "Page Info" window
		 */
		tabName : "ccffextTab"
	},

	/**
	 * External state.
	 *
	 * Keeps references to external objects
	 */
	state :
	{
		/**
		 * The "gBrowser" object, representing the tabbed browser component.
		 *
		 * Must be initialized in the {@link ccffext.init} routine
		 */
		browser : null
	},

	/**
	 * The cache for analysed pages.
	 *
	 * The cache is used to store the {@link NsIRequest} objects.
	 *
	 * The simplest implementation is provided. Should be possibly replaced with an efficient hash map implementation,
	 * reduced on a regular basis according to the age of the contents
	 *
	 * @see https://developer.mozilla.org/en/XPCOM_Interface_Reference/NsIRequest
	 */
	cache :
	{
		/**
		 * The cache backend, initially empty
		 */
		backend : {},

		/**
		 * Returns a hash value for a {@link NsIRequest} object.
		 *
		 * This implementation uses the URI of the request as a hash value
		 *
		 * @param request A {@link NsIRequest} object
		 * @return string A hash
		 */
		hash : function(request)
		{
			return request.name;
		},

		/**
		 * Checks if the cache contains a {@link NsIRequest} object
		 *
		 * @param request A {@link NsIRequest} object
		 * @return boolean True if the cache contains the request, false otherwise
		 */
		contains : function(request)
		{
			return undefined != ccffext.cache.backend[ccffext.cache.hash(request)];
		},

		/**
		 * Stores a request in the cache
		 *
		 * @param request A {@link NsIRequest} object
		 */
		put : function(request)
		{
			ccffext.cache.backend[ccffext.cache.hash(request)] = request;
		}
	},

	/**
	 * Initialization routine.
	 *
	 * Stores references to external objects for further use, registers the window loading event listener
	 *
	 * @param state References to external objects
	 */
	init : function(state)
	{
		ccffext.state = state;

		window.addEventListener("load",ccffext.listener.windowLoad,false);
	},

	/**
	 * Writes a message to the console if the {@link ccffext.config.loggingEnabled} is true
	 *
	 * @param message A message
	 */
	log : function(message)
	{
		if (ccffext.config.loggingEnabled)
		{
			const service = Components.interfaces.nsIConsoleService;
			Components.classes["@mozilla.org/consoleservice;1"]	.getService(service).logStringMessage(message);
		}
    },

	/**
	 * Event listeners
	 */
	listener :
	{
		/**
		 * Executes when the browser window is completely loaded and initialized.
		 *
		 * Registers a {@link nsIWebProgressListener}, intercepting document loading requests
		 */
		windowLoad : function()
		{
			ccffext.state.browser.addProgressListener(ccffext.listener.progressListener);
		},

		/**
		 * Executes when the location bar icon is clicked.
		 *
		 * Shows a "Page Info" window with a special tab selected.
		 *
		 * For now, selects the first tab, because the special one is not yet implemented
		 * TODO: Implement the special tab and make this function follow the docs
		 */
		iconClick : function()
		{
			BrowserPageInfo(null,ccffext.config.tabName);
		},

		/**
		 * Intercepts document loading requests.
		 *
		 * Implements the {@link nsIWebProgressListener} interface
		 *
		 * @see https://developer.mozilla.org/en/nsIWebProgressListener
		 */
		progressListener :
		{
			/**
			 * Executes when a document loading request changes its state
			 *
			 * Filters all state changes except for the final one, indicating the loading process is finished, stores
			 * the request in the cache, looks for "<a href='...' rel='license'>...</a>" tags and shows alert
			 * notifications with license URIs
			 * TODO: Change this demo behavior
			 *
			 * @param progress A {@link nsIWebProgress} object
			 * @param request A {@link nsIRequest} object
			 * @param flags A bit set
			 * @param status A {@link nsresult} object
			 */
			onStateChange : function(progress,request,flags,status)
			{
				const STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;
				const NETWORK = Components.interfaces.nsIWebProgressListener.STATE_IS_NETWORK;
				const WINDOW = Components.interfaces.nsIWebProgressListener.STATE_IS_WINDOW;

				if ((STOP | NETWORK | WINDOW) == flags)
				{
					if (! ccffext.cache.contains(request))
					{
						ccffext.cache.put(request);
					}

					const document = progress.DOMWindow.document;
					const pattern = "//a[@rel = 'license']";
					const tags = document.evaluate(pattern,document,null,XPathResult.ANY_TYPE,null);
					for (var tag = tags.iterateNext(); tag; tag = tags.iterateNext())
					{
						alert(tag.getAttribute("href"));
					}
				}
			},

			onLocationChange : function() {},
			onProgressChange : function() {},
			onSecurityChange : function() {},
			onStatusChange : function() {}
		}
	}
};