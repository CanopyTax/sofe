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
});
