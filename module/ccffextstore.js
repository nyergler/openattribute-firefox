var EXPORTED_SYMBOLS = [ "ccffextstore" ];

/**
 * The cache for analysed pages.
 *
 * The cache is used to store the {@link NsIRequest} objects.
 *
 * The simplest implementation is provided. Should be possibly replaced with an efficient hash map implementation,
 * reduced on a regular basis according to the age of the contents
 */
var ccffextstore =
{

	/**
	 * The cache backend, initially empty
	 */
	keys : {},
	values : {},

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
		return request;
	},

	/**
	 * Checks if the cache contains a {@link NsIRequest} object
	 *
	 * @param request A {@link NsIRequest} object
	 * @return boolean True if the cache contains the request, false otherwise
	 */
	contains : function(request)
	{
		return undefined != ccffextstore.keys[ccffextstore.hash(request)];
	},

	/**
	 * Stores a request in the cache
	 *
	 * @param request A {@link NsIRequest} object
	 */
	put : function(request,triples)
	{
		const hash = ccffextstore.hash(request);
		ccffextstore.keys[hash] = request;
		ccffextstore.values[hash] = triples;
	},

	get : function(request)
	{
		const hash = ccffextstore.hash(request);
		return ccffextstore.values[hash];
	}
};