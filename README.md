# Sofe
Service Oriented Front-end
Status: [![Build Status](https://travis-ci.org/CanopyTax/sofe.svg?branch=master)](https://travis-ci.org/CanopyTax/sofe) [![codecov.io](https://codecov.io/github/CanopyTax/sofe/coverage.svg?branch=master)](https://codecov.io/github/CanopyTax/sofe?branch=master)

## Motivation for Front-end Services
1. Easier to organize and scale teams
2. Promotes culture of ownership, autonomy, responsibility and accountability
3. Granular release planning
4. High trust, low processes
5. Encourages re-use
6. Avoid the re-write by providing easier upgrade ability. Less framework lock-in.
7. Deploy once, update everywhere

## Front-end Services
1. Independently deployable
2. Bounded context (100% self-contained)
3. Interaction is strictly via API
4. Has it's own data store, does not share same data structures as other services. Individually responsible for server communication.
5. Services are loaded at *run-time* and therefore *not* bundled into the app (services themselves can be built and bundled but are independent deployables)
6. Services need to be written in the ES6 module syntax

## Sofe API
The following examples assume a deployed authentication service.

*Notes on custom sytemjs plugins: https://github.com/systemjs/systemjs/blob/master/docs/creating-plugins.md*

### Configuring Sofe
Each deployed service has a unique name. Sofe will resolve the service name into a URL where the service can be loaded.
Sofe makes the resolution process flexible and configurable.

#### Automatic Resolution
By default, sofe will resolve services by assuming that the name corresponds to an npm package. If the name exists on npm,
sofe will load http://registry.npmjs.org/auth-service and find a `sofe` attribute within the `package.json` file.
The `sofe` attribute should be an object with a `url` attribute which tells sofe where to get the service deployable.

For example, a `canopy-auth` service could automatically be resolved if `canopy-auth` was published to npm with the following
`package.json`:
```json
{
  "name": "canopy-auth",
  "version": "1.0.0",
  "sofe": {
    "url": "https://cdn.canopytax.com/canopy-auth/1.0.0/auth.js"
  }
}
```
Automatic resolution is convenient because it enables service auto discovery. Simply deploy the service to npm and a deployable file to a CDN and automatically any application can resolve and load the service. The downside is that to for every application that loads the service (and for each other service), npm always has to be checked before the service can actually be loaded. A convenient CDN for automatic resolution is https://npmcdn.com

Configure a custom npm registry:
```javascript
System.config({
  sofe: {
    registry: 'https://registry.internal.canopytax.com'
  }
});
```

#### Manifest Resolution
Instead of automatically resolving services, provide a manifest map of services with associated service deployable locations.
Hard code the manifest within the System.js config:
```javascript
System.config({
  sofe: {
    manifest: {
      "auth": "http://somelocation.com/auth.js"
    }
  }
});
```

Instead of hard-coding the manifest, the application can make an http request for the manifest:
```javascript
System.config({
  sofe: {
    manifestUrl: 'https://cdn.canopytax.com/canopy-services.json'
  }
});
```

The manifest should be JSON with a `sofe` attribute:
```json
{
  "sofe": {
    "manifest": {
      "auth": "http://somelocation.com/auth.js"
    }
  }
}
```

This manifest can easily be hosted by npm as a part of your `package.json`. For example:

```javascript
System.config({
  sofe: {
    manifestUrl: 'https://registry.npmjs.org/canopy-services'
  }
});
```

The `package.json` file of `canopy-services` would be:
```json
{
  "name": "canopy-services",
  "version": "1.0.0",
  "sofe": {
    "manifest": {
      "auth": "http://somelocation.com/auth.js"
    }
  }
}
```

When you need to add a new service or update an existing one, publish a new version of `canopy-services`.

### Run-time async loading
If your application is bundled, services need to be loaded with the ECMA `System.import` standard:
```javascript
// Utilize the sofe loader with System.js
System.import('auth!sofe')
  .then((auth) => {
    // do something with the auth service
  })
```

```javascript
// Use the sofe loader directly independently of System.js
sofe.import('auth')
  .then((auth) => {
    // do something with the auth service
  })
```

### Run-time synchronous loading
If your application uses System.js you can utilize synchronous loading:
```javascript
import auth from 'auth!sofe';
// do something with auth service
```
