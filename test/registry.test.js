var root = 'http://localhost:' + window.location.port + '/base';

describe('registry resolution', function() {

	var system;

	beforeEach(function() {
		system = new System.constructor();
	});

	afterEach(function() {
		window.sofe.clearCache();
	});

	it('should resolve a service with a simple sofe registry', function(run) {

		system.config({
			sofe: {
				registry: root + '/test/registry'
			}
		});

		system.import('simple-remote!/base/src/sofe.js')
			.then(function(simple) {
				expect(simple()).toBe('mumtaz');
				run();
			});
	});

	it('should throw an error for a bad registry json response', function(run) {

		system.config({
			sofe: {
				registry: root + '/test/registry'
			}
		});

		system.import('malformed!/base/src/sofe.js')
			.catch(function(err) {
				expect(err.message.split('\n')[0]).toBe('(SystemJS) Invalid registry response for service: malformed')
				run();
			})
	});
});
