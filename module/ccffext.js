var EXPORTED_SYMBOLS = ["ccffext"];

/**
 * An extension of the "Array" object's prototype. Inspired by Shamasis Bhattacharya's code
 *
 * @return array An array of unique items
 * @see http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
 */
Array.prototype.unique = function()
{
	var object = {}, result = [];

    for(let i = 0; i < this.length; ++i)
    {
	    object[this[i]] = this[i];
    }

    for(let i in object)
    {
	    result.push(object[i]);
    }

    return result;
};

/**
 * Main extension object.
 * Behaves as a namespace for all code
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
	 * Licensed objects (RDFa subjects) methods
	 */
	objects :
	{
		/**
		 * Top-level predicates that mark licensed objects
		 */
		predicates :
		{
			"http://www.w3.org/1999/xhtml/vocab#" : ["copyright","license"]
		},

		/**
		 * Finds licensed objects in a page
		 *
		 * @param location Location of the page containing licensed objects
		 * @return array Array of objects
		 */
		extract : function(location)
		{
			var subjects = [];

			for (let i = 0, statements = ccffext.cache.get(location).statements; i < statements.length; ++i)
			{
				for (let j in this.predicates)
				{
					for (let k = 0; k < this.predicates[j].length; ++k)
					{
						if (statements[i].predicate.uri == j + this.predicates[j][k])
						{
							subjects.push(statements[i].subject);
						}
					}
				}
			}

			return subjects.unique();
		},

		/**
		 * Checks if the cache contains the information for a document, calling a callback if not. Then calls a callback
		 * if the document has any licensed objects
		 */
		callbackify : function(document,callbackDocument,callbackHas,callbackNotCached)
		{
			const location = document.location.href;

			// For all pages, except for system ones like "about:blank", "about:config" and so on
			if (! location.match(/^about\:/i))
			{
				if (! ccffext.cache.contains(location) && callbackNotCached)
				{
					callbackNotCached(document,callbackDocument);
				}

				if (ccffext.cache.contains(location))
				{
					const objects = ccffext.objects.extract(location);

					if (0 < objects.length && callbackHas)
					{
						callbackHas(document,callbackDocument);
					}
				}
			}
		},

		/**
		 * Returns a title for a licensed object.
		 * TODO There must be a smart algorithm implemented, involving usage of additional RDFa properties.
		 * For now only the case when the object refers to the current document is processed in a smart way
		 *
		 * @param document The analysed document
		 * @param object The object
		 */
		getTitle : function(document,object)
		{
			return document.location.href == object.uri ? ccffext.l10n.get("object.title.current-page.label") : object.uri;
		},

		/**
		 * Returns a source for a licensed object.
		 * TODO There must be a smart algorithm implemented, involving usage of additional RDFa properties
		 *
		 * @param document The analysed document
		 * @param object The object
		 */
		getSource : function(document,object)
		{
			return object.uri;
		}
	},

	/**
	 * UI-related code
	 */
	ui :
	{
		/**
		 * The location bar icon-related code
		 */
		icon :
		{
			/**
			 * A XUL object represention the icon
			 */
			icon : undefined,

			/**
			 * Initializes the container for the icon and the icon itself
			 *
			 * @param document DOM document for the container and the icon
			 * @param callback A callback function that is called when clicking on the icon
			 */
			init : function(document,callback)
			{
				this.icon = document.createElement("image");

				with (this.icon)
				{
					setAttribute("id","ccffext-icon");
					addEventListener("click",callback,true);
				}
			},

			/**
			 * Shows the icon. The icon is put to the container using DOM
			 *
			 * @param document DOM document for the container and the icon
			 */
			show : function(document)
			{
				var container = document.getElementById("urlbar-icons");
				container.setAttribute("ccffext-icon","true");
				container.appendChild(this.icon);
			},

			/**
			 * Hides the icon. The icon is removed from the container using DOM
			 *
			 * @param document DOM document for the container and the icon
			 */
			hide : function(document)
			{
				var container = document.getElementById("urlbar-icons");

				if (container.hasAttribute("ccffext-icon"))
				{
					container.removeAttribute("ccffext-icon");
					container.removeChild(this.icon);
				}
			}
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