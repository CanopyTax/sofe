describe('sofe api', () => {
	let validManifestUrl = 'http://localhost:' + window.location.port + '/base/test/manifests/simple.json';

	let system;

	beforeEach(function() {
		system = new System.constructor();
	});

	describe('getManifest external api', function() {
		it('accepts a string and returns the same promise as the internal getManifest api with the correct config', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				sofe
				.getManifest(validManifestUrl)
				.then(function(manifest) {
					expect(typeof manifest).toBe("object");
					done();
				})
				.catch(fail);
			})
			.catch(fail)
		});

		it('rejects if invalid manifest', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				sofe
				.getManifest(validManifestUrl + 'garbage')
				.then(fail)
				.catch(done);
			})
			.catch(fail)
		});

		it('throws if not given a string', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				expect(function() { sofe.getManifest({}) }).toThrow();
				done();
			})
			.catch(fail)
		});
	});

	describe('getServiceName external api', function() {
		it('throws if not given a string or object', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				expect(function () {sofe.getServiceName(23423)}).toThrow();
				expect(function () {sofe.getServiceName(null)}).toThrow();
				expect(function () {sofe.getServiceName(undefined)}).toThrow();
				done();
			})
			.catch(fail);
		});

		it('throws if the given object doesn\'t have a string "address" property', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				expect(function () {sofe.getServiceName({address: []})}).toThrow();
				expect(function () {sofe.getServiceName({})}).toThrow();
				done();
			})
			.catch(fail);
		});

		it('parses out the service name from a url', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				expect(sofe.getServiceName("https://localhost:8080/service-name")).toEqual("service-name");
				done();
			})
			.catch(fail);
		});

		it('parses out the service name from a SystemJS load object', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				let load = {
					address: "https://localhost:8083/service-name",
					meta: {}
				};
				expect(sofe.getServiceName(load)).toEqual('service-name');
				done();
			})
			.catch(fail);
		});

		it('parses service name from a relative path with ports', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				let load = {
					address: "https://localhost:8083/service-name/relative.js",
					meta: {}
				};
				expect(sofe.getServiceName(load)).toEqual('service-name');
				done();
			})
			.catch(fail);
		});

		it('parses service name from a relative path', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				let load = {
					address: "https://localhost/service-name/relative.js",
					meta: {}
				};
				expect(sofe.getServiceName(load)).toEqual('service-name');
				done();
			})
			.catch(fail);
		});

		it('parses service name from a relative path with dot', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				let load = {
					address: "https://localhost/service-name.css/relative.js",
					meta: {}
				};
				expect(sofe.getServiceName(load)).toEqual('service-name.css');
				done();
			})
			.catch(fail);
		});

		it('parses service name with query params', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				let load = {
					address: "https://localhost/service-name/relative.js?something=wow",
					meta: {}
				};
				expect(sofe.getServiceName(load)).toEqual('service-name');
				done();
			})
			.catch(fail);
		});

		it('parses service name with hash', function(done) {
			system
			.import('/base/src/sofe.js')
			.then(function(sofe) {
				let load = {
					address: "https://localhost/service-name/relative.js#/something",
					meta: {}
				};
				expect(sofe.getServiceName(load)).toEqual('service-name');
				done();
			})
			.catch(fail);
		});
	});

	describe('Relative service', function() {
		it('resolve a service with no path', function(done) {
			system
			.import('/base/src/utils.js')
			.then(function(utils) {
				expect(
					utils.getUrlFromService('https://localhost/someService', 'http://hi.com/someService.js')
				).toBe('http://hi.com/someService.js')

				done();
			})
			.catch(fail);
		});

		it('resolve a service a path', function(done) {
			system
			.import('/base/src/utils.js')
			.then(function(utils) {
				expect(
					utils.getUrlFromService('https://localhost/someService/tester.js', 'http://hi.com/someService.js')
				).toBe('http://hi.com/tester.js')

				done();
			})
			.catch(fail);
		});

		it('resolve a service a path with directories', function(done) {
			system
			.import('/base/src/utils.js')
			.then(function(utils) {
				expect(
					utils.getUrlFromService('https://localhost/someService/dir1/dir2/tester.js', 'http://hi.com/someService.js')
				).toBe('http://hi.com/dir1/dir2/tester.js')

				done();
			})
			.catch(fail);
		});

		it('resolve a service a path with directories on both', function(done) {
			system
			.import('/base/src/utils.js')
			.then(function(utils) {
				expect(
					utils.getUrlFromService('https://localhost/someService/dir1/dir2/tester.js', 'http://hi.com/dir3/someService.js')
				).toBe('http://hi.com/dir3/dir1/dir2/tester.js')

				done();
			})
			.catch(fail);
		});
	});
});
