var urls = require('cpr-select!dist/sofe.js');
var _ = require('lodash!dist/sofe.js');
var local = require('./dir/local.js');

var session = {
	id: 1111,
	guid: _.uniqueId(),
	host: urls.getHost(),
	local: local()
}

module.exports = {
	getSession: function() {
		return session;
	}
}
