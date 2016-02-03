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
				expect(error.message.split('\n')[0]).toBe('Invalid registry response for service: DoesNotExist');
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
				expect(err.message.split('\n')[0]).toBe('Invalid manifest: must be parseable JSON');
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
				expect(err.message.split('\n')[0]).toBe('Invalid manifest JSON: must include a sofe attribute with a manifest object');
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
});
