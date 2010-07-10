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
 * Code modules inclusion.
 * Note that the modules are loaded only once
 *
 * @see https://developer.mozilla.org/en/Components.utils.import
 */
{
	Components.utils.import("resource://ccffext/rdfa.js"); // RDFa parser
	Components.utils.import("resource://ccffext/ccffext.js"); // Main extension code module
}