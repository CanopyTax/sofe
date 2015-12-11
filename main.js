System.import('auth!sofe.js')
	.then(function(auth) {
		console.log(auth.getSession());
	})
