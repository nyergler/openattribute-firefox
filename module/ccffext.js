var EXPORTED_SYMBOLS = ["ccffext"];

/**
 * Main extension object.
 *
 * Behaves as a namespace for all code, containing configuration and references to objects and routines
 */
var ccffext =
{
	/**
	 * Localization object that is used to fetch localized strings from a property file
	 */
	l10n :
	{
		/**
		 * Bundle holding all strings
		 */
		bundle : Components.classes["@mozilla.org/intl/stringbundle;1"]
				.getService(Components.interfaces.nsIStringBundleService)
				.createBundle("chrome://ccffext/locale/locale.properties"),

		/**
		 * Fetched a string by its name from the bundle
		 *
		 * @param name The name of a string
		 * @return string A string
		 */
		get : function(name)
		{
			return this.bundle.GetStringFromName(name);
		}
	},

	/**
	 * Cache of analysed pages that is used to store the RDFa information.
	 * The "hashing" approach is used
	 *
	 * @see http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
	 */
	cache :
	{
		/**
		 * The cache backend, initially empty
		 */
		values : {},

		/**
		 * Checks if the cache contains an object by its key
		 *
		 * @param key A key
		 * @return boolean True if the cache contains the object, false otherwise
		 */
		contains : function(key)
		{
			return undefined != this.values[key];
		},

		/**
		 * Stores a "key-object" pair in the cache
		 *
		 * @param key A key
		 * @param object An object
		 */
		put : function(key,object)
		{
			this.values[key] = object;
		},

		/**
		 * Fetches an object by its key from the cache
		 *
		 * @param key A key
		 */
		get : function(key)
		{
			return this.values[key];
		}
	},

	/**
	 * Utility function that writes a message to the JavaScript console
	 *
	 * @param message A message
	 */
	log : function(message)
	{
		Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
				.logStringMessage(message);
    }
};