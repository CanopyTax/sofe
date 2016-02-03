throw new Error(`This sofe service was bundled and needs to be removed from System.register

Make sure you run the following code for each of
your services after the bundle loads and before
the application bootstraps:

System.delete(System.normalizeSync('some-service!sofe'));
`)
