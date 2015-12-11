System.import('auth-remote!sofe.js')
	.then(function(someService) {
		console.log(someService.getSession());
	})
