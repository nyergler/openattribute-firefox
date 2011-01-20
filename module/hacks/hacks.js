var EXPORTED_SYMBOLS = ["ccffext_site_hacks"];

var ccffext_site_hacks = new function Hacks() {

    var that = this;
    var _hacks = new Array();

    this.register = function (name, regex, callback) {

	_hacks.push([name, regex, callback]);

    };

    this.match = function (location) {
	return [h[2] for each (h in _hacks)
		if (h[1].test(location))];
    };

    /**
     * 
     * Evaluate a series of xpath expressions against a document,
     * returning the string value of the first that has a match.
     * 
     * exprs is an Array of xpath expressions
     * 
     **/
    this.evaluateXpath = function (document, exprs) {

	for each (ex in exprs) {
	    var result = document.evaluate(ex,
					   document,
					   null,
					   Components.interfaces.nsIDOMXPathResult.STRING_TYPE,
					   null).stringValue;
	    if ("undefined" != typeof result) {
		return result;
	    }
	}

	return null;

    };

};

// register site hacks here
ccffext_site_hacks.register(
    "flickr", /^https?\:\/\/(www\.)?flickr\.com\/.*/,
    function(triples, location, document) {

	Components.utils.import("resource://ccffext/rdfa.js");

	var author = ccffext_site_hacks.evaluateXpath(
	    document,
	    ["//span[@class='realname']/span",
	     "//strong[@class='username']/a"]);

	if ("undefined" != typeof author) {
	    triples.add(new RDFSymbol(location),
			new RDFSymbol("http://creativecommons.org/ns#attributionName"),
			new RDFLiteral(author), 'RDFa');
	}

	var authorUri = ccffext_site_hacks.evaluateXpath(
	    document,
	    ["//span[@class='realname']/a/@href",
	     "//strong[@class='username']/a/@href"]);

	if ("undefined" != typeof authorUri) {
	    triples.add(new RDFSymbol(location),
			new RDFSymbol("http://creativecommons.org/ns#attributionURL"),
			new RDFSymbol(Util.uri.join(authorUri, location)), 
			'RDFa');

	}
    }); // flickr
