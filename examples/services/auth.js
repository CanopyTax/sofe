var _ = require('lodash!sofe');
var local = require('./local.js');

var session = {
	id: 1111,
	guid: _.uniqueId(),
	local: local()
}

module.exports = {
	getSession: function() {
		return session;
	}
}
