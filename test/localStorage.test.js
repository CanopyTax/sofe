var root = 'http://localhost:' + window.location.port + '/base';

describe('browser storage resolution', function() {
  var system;

  beforeEach(function() {
    system = new System.constructor();
    system.config({
      sofe: {
        manifestUrl: root + '/test/manifests/simple.json'
      }
    })
  });

  afterEach(function() {
    window.localStorage.removeItem('sofe:simple');
    window.sessionStorage.removeItem('sofe:simple');
    window.localStorage.removeItem('sofe:relative');
    window.sessionStorage.removeItem('sofe:relative');
    window.sofe.clearCache();
  });

  describe('session storage', function() {
    it('should resolve the url from session storage, even if it is in the manifest', function(done) {
      //override what's in the manifest
      window.sessionStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js');
      system.import('simple!/base/src/sofe.js')
      .then(function(service) {
        //the service should be simple2.js instead of simple1.js
        expect(service()).toEqual('kwayis');
        done();
      });
    });

    it('should resolve the url from session storage, even if it could have been resolved from localStorage', function(done) {
      //override what's in the manifest
      window.sessionStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js');
      window.localStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple1.js');
      system.import('simple!/base/src/sofe.js')
      .then(function(service) {
        //the service should be simple2.js instead of simple1.js
        expect(service()).toEqual('kwayis');
        done();
      });
    });
  });

  describe('localStorage', function() {
    it('should resolve the url from localStorage, if it cannot resolve it from session storage but could have from the manifest', function(done) {
      //override what's in the manifest
      window.localStorage.setItem('sofe:simple', 'http://localhost:9876/base/test/services/simple2.js');
      system.import('simple!/base/src/sofe.js')
      .then(function(service) {
        //the service should be simple2.js instead of simple1.js
        expect(service()).toEqual('kwayis');
        done();
      });
    });
  });
});
