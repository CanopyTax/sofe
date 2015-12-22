var root = 'http://localhost:' + window.location.port + '/base';

describe('static resolution', function() {

  var system;

  beforeEach(function() {
    system = new System.constructor();
  });

  afterEach(function() {
    window.sofe.clearCache();
  });

  it('should resolve a service', function(run) {
    system.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js'
        }
      }
    });

    system.import('simple!/base/src/sofe.js')
      .then(function(auth) {
        expect(auth()).toBe('mumtaz');
        run();
      })
  });

  it('should resolve multiple services at a time', function(run) {
    system.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simple2: root + '/test/services/simple2.js',
        }
      }
    });

    Promise.all([
      system.import('simple!/base/src/sofe.js'),
      system.import('simple2!/base/src/sofe.js')
    ]).then(function(resp) {
      expect(resp[0]()).toBe('mumtaz');
      expect(resp[1]()).toBe('kwayis');
      run();
    })
  });

  it('should resolve service dependencies that are other services', function(run) {
    system.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simpleDependency: root + '/test/services/simpleDependency.js',
        }
      }
    });

    system.import('simpleDependency!/base/src/sofe.js')
      .then(function(simple) {
        expect(simple().data).toBe('mumtaz');
        run();
      });
  });

  it('should resolve deep service dependencies', function(run) {
    system.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simpleDependency: root + '/test/services/simpleDependency.js',
          deep: root + '/test/services/deepDependency.js'
        }
      }
    });

    system.import('deep!/base/src/sofe.js')
      .then(function(deep) {
        expect(deep().data).toBe('mumtaz');
        run();
      });
  });

  it('should resolve relative dependencies inside services', function(run) {
    system.config({
      sofe: {
        manifest: {
          relative: root + '/test/services/relativeDependency.js'
        }
      }
    });

    system.import('relative!/base/src/sofe.js')
      .then(function(deep) {
        expect(deep().data).toBe('mumtaz');
        run();
      });
  });

  it('should resolve deep relative dependencies inside services', function(run) {
    system.config({
      sofe: {
        manifest: {
          deepRelative: root + '/test/services/deepRelative.js'
        }
      }
    });

    system.import('deepRelative!/base/src/sofe.js')
      .then(function(deep) {
        expect(deep().data).toBe('mumtaz');
        run();
      });
  });

  it('should throw an error for an undefined service', function(run) {
    system.config({
      sofe: {
        manifest: {}
      }
    });

    system.import('DoesNotExist!/base/src/sofe.js')
      .catch(function(error) {
        expect(error.message.split('\n')[0]).toBe('Invalid registry response for service: DoesNotExist');
        run();
      });
  });
});
