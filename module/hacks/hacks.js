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

};

// register site hacks here
ccffext_site_hacks.register(
    "flickr", /^https?\:\/\/(www\.)?flickr\.com\/.*/,
    function(triples, location, document) {

	Components.utils.import("resource://ccffext/rdfa.js");

	var author = document.evaluate("//span[@class='realname']/a",
				       document,
				       null,
				       Components.interfaces.nsIDOMXPathResult.STRING_TYPE,
				       null).stringValue;

	if ("undefined" != typeof author) {
	    triples.add(new RDFSymbol(location),
			new RDFSymbol("http://creativecommons.org/ns#attributionName"),
			new RDFLiteral(author), 'RDFa');
	}

	var authorUri = document.evaluate("//span[@class='realname']/a/@href",
				       document,
				       null,
				       Components.interfaces.nsIDOMXPathResult.STRING_TYPE,
				       null).stringValue;
	if ("undefined" != typeof authorUri) {
	    triples.add(new RDFSymbol(location),
			new RDFSymbol("http://creativecommons.org/ns#attributionURL"),
			new RDFSymbol(Util.uri.join(authorUri, location)), 
			'RDFa');

	}
    }); // flickr
