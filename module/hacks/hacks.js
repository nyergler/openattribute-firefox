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
	
    }); // flickr
