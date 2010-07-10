var EXPORTED_SYMBOLS = ["ccffext"];

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
		loggingEnabled : true
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
		browser : null,

		rdfa : null
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

		ccffext.state.browser.addEventListener("load",ccffext.listener.documentLoad,true);
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
			Cc["@mozilla.org/consoleservice;1"]	.getService(Ci.nsIConsoleService).logStringMessage(message);
		}
    },

	/**
	 * Event listeners
	 */
	listener :
	{
		documentLoad : function(event)
		{
			const document = event.originalTarget;

			if (document instanceof HTMLDocument)
			{
				const location = document.location.href;

				if (! location.match(/^about\:/i))
				{
					if (! ccffextstore.contains(location))
					{
						XH.transform(document.getElementsByTagName("body")[0]);
						XH.transform(document.getElementsByTagName("head")[0]);
						ccffext.state.rdfa.reset();
						ccffext.state.rdfa.parse(document);
						ccffextstore.put(location,ccffext.state.rdfa.triplestore);
					}
				}
			}
		},

		tabShow : function(document)
		{
			const content = document.getElementById("ccffextPanel-content");
			content.value = ccffextstore.get(window.opener.content.document.location.href);
		}
	}
};