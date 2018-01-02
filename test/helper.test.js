let root = 'http://localhost:' + window.location.port + '/base';

describe('helpers', function() {

  let system;

  beforeEach(function() {
    system = new System.constructor();

    system.config({
      sofe: {
        manifestUrl: root + '/test/manifests/simple.json'
      }
    });
  });

  describe('isOverride', function() {

    afterEach(function() {
      window.sofe.clearCache();
      window.localStorage.removeItem('sofe:simple');
    });

    it('should return false when no services are overriden', function(run) {
      Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
        .then(function(values) {
          expect(values[2].isOverride()).toBe(false);
          run();
        })
        .catch(fail);
    });

    it('should return false when a service is overriden but after it is already loaded', function(run) {
      Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
        .then(function(values) {
          window.sessionStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js', system.import('/base/src/sofe.js'));
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
          run();
        })
        .catch(fail);
    });

    it('should return true for an individual overriden service', function(run) {
      window.sessionStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js', system.import('/base/src/sofe.js'));

      Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
        .then(function(values) {
          expect(values[2].isOverride('simple')).toBe(true);
          run();
        })
        .catch(fail);
    });

    it('should return false for an individual non-overriden service', function(run) {
      window.sessionStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js', system.import('/base/src/sofe.js'));

      Promise.all([system.import('simple!/base/src/sofe.js'), system.import('simple2!/base/src/sofe.js'), system.import('/base/src/sofe.js')])
        .then(function(values) {
          expect(values[2].isOverride('muffin')).toBe(false);
          run();
        })
        .catch(fail);
    });
  });
});
