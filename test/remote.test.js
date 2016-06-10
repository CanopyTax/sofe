var root = 'http://localhost:' + window.location.port + '/base';

describe('remote resolution', function() {

	var system;

	beforeEach(function() {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/simple.json'
			}
		});
	});

	afterEach(function() {
		window.sofe.clearCache();
	});

	it('should resolve a remote manifest and load a simple service', function(run) {
		system.import('simple!/base/src/sofe.js')
			.then(function(simple) {
				expect(simple()).toBe('mumtaz');
				run();
			});
	});

	it('should resolve multiple services within a remote manifest', function(run) {
		Promise.all([
			system.import('simple!/base/src/sofe.js'),
			system.import('simple2!/base/src/sofe.js')
		])
		.then(function(resp) {
			expect(resp[0]()).toBe('mumtaz');
			run();
		});
	});

	it('should resolve service dependencies that are other services', function(run) {
		system.import('simpleDependency!/base/src/sofe.js')
			.then(function(simple) {
				expect(simple().data).toBe('mumtaz');
				run();
			});
	});

	it('should resolve deep service dependencies', function(run) {
		system.import('deep!/base/src/sofe.js')
			.then(function(deep) {
				expect(deep().data).toBe('mumtaz');
				run();
			});
	});

	it('should resolve relative dependencies inside services', function(run) {
		system.import('relative!/base/src/sofe.js')
			.then(function(deep) {
				expect(deep().data).toBe('mumtaz');
				run();
			});
	});

	it('should resolve deep relative dependencies inside services', function(run) {
		system.import('deepRelative!/base/src/sofe.js')
			.then(function(deep) {
				expect(deep().data).toBe('mumtaz');
				run();
			});
	});

	it('should throw an error for an undefined service', function(run) {
		system.import('DoesNotExist!/base/src/sofe.js')
			.catch(function(error) {
				expect(error.message.split('\n')[0]).toBe('(SystemJS) Invalid registry response for service: DoesNotExist');
				run();
			});
	});

	it('should throw an error for unparseable json manifest', function(run) {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/malformed.json'
			}
		});

		system.import('deepRelative!/base/src/sofe.js')
			.then(function(something) {
				run();
			})
			.catch(function(err) {
				expect(err.message.split('\n')[0]).toBe('(SystemJS) Invalid manifest: must be parseable JSON');
				run();
			});
	});

	it('should throw an error if manifest does not contain a sofe attribute', function(run) {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/nosofe.json'
			}
		});

		system.import('deepRelative!/base/src/sofe.js')
			.then(function(something) {
				run();
			})
			.catch(function(err) {
				expect(err.message.split('\n')[0]).toBe("(SystemJS) Invalid manifest JSON at '" + system.sofe.manifestUrl + "': a manifest must include a sofe attribute");
				run();
			});
	});

	it("should throw an error if the manifest does not contain a 'manifest' or 'manifestUrl' property", function(run) {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/sofe-but-no-manifest.json'
			}
		});

		system.import('deepRelative!/base/src/sofe.js')
			.then(function(something) {
				expect(1).toBe('System.import should fail when there is a bad sofe manifest');
				run();
			})
			.catch(function (err) {
				expect(err.message.split('\n')[0]).toBe("(SystemJS) Invalid manifest JSON at '" + system.sofe.manifestUrl + "': there must either be a 'sofe.manifest' object or 'sofe.manifestUrl' string");
				run();
			});
	});

	it("should throw an error if the manifest's sofe.manifest propety is not an object", function(run) {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/sofe-but-string-manifest.json'
			}
		});

		system.import('deepRelative!/base/src/sofe.js')
			.then(function(something) {
				expect(1).toBe('System.import should fail when there is a bad sofe manifest');
				run();
			})
			.catch(function (err) {
				expect(err.message.split('\n')[0]).toBe("(SystemJS) Invalid manifest JSON at '" + system.sofe.manifestUrl + "': the 'manifest' property must be a plain object");
				run();
			});
	});

	it('should override remote manifest urls with local static definitions', function(run) {

		system = new System.constructor();

		system.config({
			sofe: {
				manifest: {
					simple: 'http://localhost:9876/base/test/services/simple2.js'
				},
				manifestUrl: root + '/test/manifests/simple.json'
			}
		});

		// Load simple but really it is loading simple2 cause it is overriden
		system.import('simple!/base/src/sofe.js')
			.then(function(simple2) {
				expect(simple2()).toBe('kwayis');
				run();
			})
	});

	// Test #13
	it('never retrieves the manifest file more than once', function(run) {
		var numManifestAjaxRequests = 0;
		recordAjax();
		Promise.all([
			system.import('simple!/base/src/sofe.js'),
			system.import('simple2!/base/src/sofe.js'),
		])
		.then(function() {
			stopRecordingAjax();
			expect(numManifestAjaxRequests).toBe(1);
			run();
		})
		.catch(function(ex) {
			stopRecordingAjax();
			throw ex;
		});

		var originalXHROpen;

		function recordAjax() {
			originalXHROpen = XMLHttpRequest.prototype.open;
			XMLHttpRequest.prototype.open = function(method, url) {
				if (url.endsWith('manifests/simple.json')) {
					numManifestAjaxRequests++;
				}
				return originalXHROpen.apply(this, arguments);
			}
		}

		function stopRecordingAjax() {
			XMLHttpRequest.prototype.open = originalXHROpen;
		}
	});

	// Tests issue #20
	it("fails to import a sofe service if the sofe-manifest file doesn't exist", function(run) {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/nonexistent-manifest-file.json'
			}
		});

		system.import('deepRelative!/base/src/sofe.js')
			.then(function(something) {
				expect(1).toBe("Sofe imports should fail if the manifest file is invalid")
				run();
			})
			.catch(function(err) {
				expect(err.message.split('\n')[0]).toBe('(SystemJS) Invalid manifest: must be parseable JSON');
				run();
			});
	});

	describe('chained manifests', function() {
		afterEach(function() {
			window.sofe.clearCache();
		});

		it('should be able to import a sofe service that is defined in a chained manifest file', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/chained-valid-manifest.json'
				}
			});

			system.import('deepRelative!/base/src/sofe.js')
				.then(function(something) {
					expect(something().data).toBe('mumtaz');
					run();
				})
				.catch(function(err) {
					expect(false).toBe(err);
					run();
				});
		});

		it('should allow for both a manifest and a manifestUrl property, with the manifest property overwriting what is in the chained manifestUrl manifest', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/chained-with-overrides.json'
				}
			});

			Promise.all([system.import('simple1!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js')])
				.then(function(values) {
					// simple1 is overridden in the chained-with-overrides.json manifest file to really point to simple2.js
					expect(values[0]()).toBe('kwayis');

					// simple2 is not overriden in the chained-with-overrides.json manifest file, so it still points to simple2.js
					expect(values[1]()).toBe('kwayis');
					run();
				})
				.catch(function(err) {
					expect(false).toBe(err);
					run();
				});
		});

		it('should fail if the chained manifests have circular dependencies', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/chained-circular.json'
				}
			});

			system.import('deepRelative!/base/src/sofe.js')
				.then(function(something) {
					expect(false).toBe("Import should have failed")
					run();
				})
				.catch(function(err) {
					expect(err.message.split('\n')[0]).toBe("(SystemJS) Cannot load manifest -- circular chain of sofe manifests, 'http://localhost:9876/base/test/manifests/chained-circular.json' detected twice in chain.");
					run();
				});
		});

		it('should fail if the chained manifest file is invalid', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/chained-manifest-to-malformed.json'
				}
			});

			system.import('deepRelative!/base/src/sofe.js')
				.then(function(something) {
					expect(false).toBe("Import should fail");
					run();
				})
				.catch(function(err) {
					expect(err.message.split('\n')[0]).toBe('(SystemJS) Invalid manifest: must be parseable JSON');
					run();
				});
		});

		it('should return manifests', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/chained-with-overrides.json',
					manifest: {
						tester: 'hi'
					}
				}
			});

			Promise.all([system.import('simple1!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
				.then(function(values) {
					values[2].getAllManifests()
						.then(function(resp) {
							expect(resp).toEqual({
								"flat": {
									"simple": "http:\/\/localhost:9876\/base\/test\/services\/simple1.js",
									"simple2": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
									"simpleDependency": "http:\/\/localhost:9876\/base\/test\/services\/simpleDependency.js",
									"deep": "http:\/\/localhost:9876\/base\/test\/services\/deepDependency.js",
									"relative": "http:\/\/localhost:9876\/base\/test\/services\/relativeDependency.js",
									"deepRelative": "http:\/\/localhost:9876\/base\/test\/services\/deepRelative.js",
									"simple1": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
									"tester": "hi"
								},
								"all": {
									"static": {
										"manifest": {
											"tester": "hi"
										},
										"parent": null
									},
									"http:\/\/localhost:9876\/base\/test\/manifests\/chained-with-overrides.json": {
										"manifest": {
											"simple1": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js"
										},
										"parent": "static"
									},
									"http:\/\/localhost:9876\/base\/test\/manifests\/simple.json": {
										"manifest": {
											"simple": "http:\/\/localhost:9876\/base\/test\/services\/simple1.js",
											"simple2": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
											"simpleDependency": "http:\/\/localhost:9876\/base\/test\/services\/simpleDependency.js",
											"deep": "http:\/\/localhost:9876\/base\/test\/services\/deepDependency.js",
											"relative": "http:\/\/localhost:9876\/base\/test\/services\/relativeDependency.js",
											"deepRelative": "http:\/\/localhost:9876\/base\/test\/services\/deepRelative.js"
										},
										"parent": "http:\/\/localhost:9876\/base\/test\/manifests\/chained-with-overrides.json"
									}
								}
							});
							run();
						})
						.catch(fail);
				})
				.catch(fail);
		});

		it('should return deeply nested manifests', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/chained-deep.json',
					manifest: {
						tester: 'hi'
					}
				}
			});

			Promise.all([system.import('simple1!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
				.then(function(values) {
					values[2].getAllManifests()
						.then(function(resp) {
							expect(resp).toEqual({
								"flat": {
									"simple": "http:\/\/localhost:9876\/base\/test\/services\/simple1.js",
									"simple2": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
									"simpleDependency": "http:\/\/localhost:9876\/base\/test\/services\/simpleDependency.js",
									"deep": "http:\/\/localhost:9876\/base\/test\/services\/deepDependency.js",
									"relative": "http:\/\/localhost:9876\/base\/test\/services\/relativeDependency.js",
									"deepRelative": "http:\/\/localhost:9876\/base\/test\/services\/deepRelative.js",
									"simple1": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
									"tester": "hi"
								},
								"all": {
									"static": {
										"manifest": {
											"tester": "hi"
										},
										"parent": null
									},
									"http:\/\/localhost:9876\/base\/test\/manifests\/chained-deep.json": {
										"manifest": {

										},
										"parent": "static"
									},
									"http:\/\/localhost:9876\/base\/test\/manifests\/chained-with-overrides.json": {
										"manifest": {
											"simple1": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js"
										},
										"parent": "http:\/\/localhost:9876\/base\/test\/manifests\/chained-deep.json"
									},
									"http:\/\/localhost:9876\/base\/test\/manifests\/simple.json": {
										"manifest": {
											"simple": "http:\/\/localhost:9876\/base\/test\/services\/simple1.js",
											"simple2": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
											"simpleDependency": "http:\/\/localhost:9876\/base\/test\/services\/simpleDependency.js",
											"deep": "http:\/\/localhost:9876\/base\/test\/services\/deepDependency.js",
											"relative": "http:\/\/localhost:9876\/base\/test\/services\/relativeDependency.js",
											"deepRelative": "http:\/\/localhost:9876\/base\/test\/services\/deepRelative.js"
										},
										"parent": "http:\/\/localhost:9876\/base\/test\/manifests\/chained-with-overrides.json"
									}
								}
							});

							run();
						})
						.catch(fail);
				})
				.catch(fail);
		});

		it('should non nested manifests', function(run) {
			system = new System.constructor();

			system.config({
				sofe: {
					manifestUrl: root + '/test/manifests/simple.json',
					manifest: {
						tester: 'hi'
					}
				}
			});

			Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
				.then(function(values) {
					values[2].getAllManifests()
						.then(function(resp) {
							expect(resp).toEqual({
								"flat": {
									"simple": "http:\/\/localhost:9876\/base\/test\/services\/simple1.js",
									"simple2": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
									"simpleDependency": "http:\/\/localhost:9876\/base\/test\/services\/simpleDependency.js",
									"deep": "http:\/\/localhost:9876\/base\/test\/services\/deepDependency.js",
									"relative": "http:\/\/localhost:9876\/base\/test\/services\/relativeDependency.js",
									"deepRelative": "http:\/\/localhost:9876\/base\/test\/services\/deepRelative.js",
									"tester": "hi"
								},
								"all": {
									"static": {
										"manifest": {
											"tester": "hi"
										},
										"parent": null
									},
									"http:\/\/localhost:9876\/base\/test\/manifests\/simple.json": {
										"manifest": {
											"simple": "http:\/\/localhost:9876\/base\/test\/services\/simple1.js",
											"simple2": "http:\/\/localhost:9876\/base\/test\/services\/simple2.js",
											"simpleDependency": "http:\/\/localhost:9876\/base\/test\/services\/simpleDependency.js",
											"deep": "http:\/\/localhost:9876\/base\/test\/services\/deepDependency.js",
											"relative": "http:\/\/localhost:9876\/base\/test\/services\/relativeDependency.js",
											"deepRelative": "http:\/\/localhost:9876\/base\/test\/services\/deepRelative.js"
										},
										"parent": "static"
									}
								}
							});

							run();
						})
						.catch(fail);
				})
				.catch(fail);
		});

	});
});
