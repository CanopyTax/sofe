var root = 'http://localhost:' + window.location.port + '/base';

describe('static resolution', function() {
  afterEach(function() {
    System.config({ sofe: null});
    window.sofe.clearCache();
  });

  it('should resolve a service', function(run) {
    System.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js'
        }
      }
    });

    System.import('simple!base/dist/sofe.js')
      .then(function(auth) {
        expect(auth()).toBe('mumtaz');
        run();
      })
  });

  it('should resolve multiple services at a time', function(run) {
    System.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simple2: root + '/test/services/simple2.js',
        }
      }
    });

    Promise.all([
      System.import('simple!base/dist/sofe.js'),
      System.import('simple2!base/dist/sofe.js')
    ]).then(function(resp) {
      expect(resp[0]()).toBe('mumtaz');
      expect(resp[1]()).toBe('kwayis');
      run();
    })
  });

  it('should resolve service dependencies that are other services', function(run) {
    System.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simple2: root + '/test/services/simple2.js',
        }
      }
    });

    Promise.all([
      System.import('simple!base/dist/sofe.js'),
      System.import('simple2!base/dist/sofe.js')
    ]).then(function(resp) {
      expect(resp[0]()).toBe('mumtaz');
      expect(resp[1]()).toBe('kwayis');
      run();
    })
  });

  it('should resolve service dependencies that are other services', function(run) {
    System.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simpleDependency: root + '/test/services/simpleDependency.js',
        }
      }
    });

    System.import('simpleDependency!base/dist/sofe.js')
      .then(function(simple) {
        expect(simple().data).toBe('mumtaz');
        run();
      });
  });

  it('should resolve deep service dependencies', function(run) {
    System.config({
      sofe: {
        manifest: {
          simple: root + '/test/services/simple1.js',
          simpleDependency: root + '/test/services/simpleDependency.js',
          deep: root + '/test/services/deepDependency.js'
        }
      }
    });

    System.import('deep!base/dist/sofe.js')
      .then(function(deep) {
        expect(deep().data).toBe('mumtaz');
        run();
      });
  });

  it('should resolve relative dependencies inside services', function(run) {
    System.config({
      sofe: {
        manifest: {
          relative: root + '/test/services/relativeDependency.js'
        }
      }
    });

    System.import('relative!base/dist/sofe.js')
      .then(function(relative) {
        expect(relative().data).toBe('mumtaz');
        run();
      });
  });

  it('should resolve deep relative dependencies inside services', function(run) {
    System.config({
      sofe: {
        manifest: {
          deep: root + '/test/services/deepRelative.js'
        }
      }
    });

    System.import('deep!base/dist/sofe.js')
      .then(function(deep) {
        expect(deep().data).toBe('mumtaz');
        run();
      });
  });

  it('should throw an error for an undefined service', function(run) {
    System.import('derp!base/dist/sofe.js')
      .catch(function(error) {
        expect(error.message.indexOf('404')).not.toBe(-1);
        run();
      });
  });
});
