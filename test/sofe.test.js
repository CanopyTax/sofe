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

	fdescribe('getServiceUrl expternal API', function() {
		afterEach(function() {
			window.sofe.clearCache();
		});

		it('returns the url of a service', function(done) {
			system.config({
				sofe: {
					manifest: {
						simple: root + '/test/services/simple1.js'
					}
				}
			});

			system
				.import("simple!/base/src/sofe.js")
				.then(function(auth) {
					system
						.import("/base/src/sofe.js")
						.then(sofe => {
							expect(sofe.getServiceUrl("simple")).toBe(
								root + "/test/services/simple1.js"
							);
							done();
						})
						.catch(fail);
				})
				.catch(fail);
		});

		it('returns the url of a service in local storage', function(done) {
			system.config({
				sofe: {
					manifest: {
						simple: root + '/test/services/simple1.js'
					}
				}
			});

			window.localStorage.setItem(
				"sofe:simple",
				"http://localhost:9876/base/test/services/simple2.js"
			);

			system
				.import("simple!/base/src/sofe.js")
				.then(function(auth) {
					system
						.import("/base/src/sofe.js")
						.then(sofe => {
							expect(sofe.getServiceUrl("simple")).toBe(
								root + "/test/services/simple2.js"
							);
							window.localStorage.removeItem('sofe:simple');
							done();
						})
						.catch(fail);
				})
				.catch(fail);
		});

		it("should throw an error if no service has been loaded", function(done) {
			system
				.import("/base/src/sofe.js")
				.then(sofe => {
					expect(sofe.getServiceUrl.bind(null, "simple")).toThrow(
						new Error(
							'Service "simple" has not been loaded, import the service before getting the service URL'
						)
					);
					done();
				})
				.catch(fail);
		});
	});
});
