System.import('auth!dist/sofe.js')
	.then(function(auth) {
		console.log(auth.getSession());
	})
