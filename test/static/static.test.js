describe('static resolution', function() {
  afterEach(function() {
    System.config({ sofe: null});
  });

  it('should resolve a service', function(run) {
    System.config({
      sofe: {
        manifest: {
          auth: 'http://localhost:9876/base/test/services/auth.js'
        }
      }
    });

    System.import('auth!base/dist/sofe.js')
      .then(function(auth) {
        expect(auth()).toBe('mumtaz');
        run();
      })
  });
});
