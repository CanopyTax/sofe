var urls = require('cpr-select!lib/index.js');

var session = {
	id: 1111,
	host: urls.getHost()
}

module.exports = {
	getSession: function() {
		return session;
	}
}
