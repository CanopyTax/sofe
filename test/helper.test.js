var root = 'http://localhost:' + window.location.port + '/base';

describe('helpers', function() {

	var system;

	beforeEach(function() {
		system = new System.constructor();

		system.config({
			sofe: {
				manifestUrl: root + '/test/manifests/simple.json'
			}
		});
	});

	describe('isOverride', function() {
		it('should return false when no services are overriden', function(run) {
			Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
				.then(function(values) {
					expect(values[2].isOverride()).toBe(false);
					run();
				})
				.catch(fail);
		});

		it('should return true when services are overriden', function(run) {
			window.sessionStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js', system.import('/base/src/sofe.js'));

			Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
				.then(function(values) {
					expect(values[2].isOverride()).toBe(true);
					window.localStorage.removeItem('sofe:simple');
					run();
				})
				.catch(fail);
		});
	});
});
