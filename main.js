System.import('auth!lib/index.js')
	.then(function(auth) {
		console.log(auth.getSession());
	})
