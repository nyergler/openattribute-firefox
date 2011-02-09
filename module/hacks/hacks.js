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

	return undefined;

    };

};

// register site hacks here

// Flickr
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
			new RDFLiteral(author.trim()), 'RDFa');
	}

	var authorUri = ccffext_site_hacks.evaluateXpath(
	    document,
	    ["//strong[@class='username']/a/@href"]);

	if ("undefined" != typeof authorUri) {
	    triples.add(new RDFSymbol(location),
			new RDFSymbol("http://creativecommons.org/ns#attributionURL"),
			new RDFSymbol(Util.uri.join(authorUri, location)), 
			'RDFa');

	}
    }); // flickr

// Wikipedia(s)
ccffext_site_hacks.register(
    "wikipedia",  /^(http\:\/\/[a-z]+\.wikipedia\.org\/wiki\/.*)|(https\:\/\/secure\.wikimedia\.org\/wikipedia\/[a-z]+\/wiki\/.*)/,
    function(triples, location, document) {

	// import the RDFa library
	Components.utils.import("resource://ccffext/rdfa.js");
	
	// Wikipedias are licensed CC BY-SA 3.0 Unported
	// remove any license triples that may have crept in
	// (enwp uses rel="license", others do not)
	triples.removeMany(new RDFSymbol(location),
			   new RDFSymbol("http://www.w3.org/1999/xhtml/vocab#license"),
			   undefined,
			   'RDFa');

	// add the license triple
	triples.add(new RDFSymbol(location),
		    new RDFSymbol("http://www.w3.org/1999/xhtml/vocab#license"),
		    new RDFSymbol("http://creativecommons.org/licenses/by-sa/3.0/"), 
		    'RDFa');	
    }); // wikipedia