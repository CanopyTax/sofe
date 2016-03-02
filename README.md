# sofe
Service Oriented Front-end

[![npm version](https://img.shields.io/npm/v/sofe.svg?style=flat-square)](https://www.npmjs.org/package/sofe)
[![Build Status](https://img.shields.io/travis/CanopyTax/sofe.svg?style=flat-square)](https://travis-ci.org/CanopyTax/sofe)
[![Code Coverage](https://img.shields.io/codecov/c/github/CanopyTax/sofe.svg?style=flat-square)](https://codecov.io/github/CanopyTax/sofe)

## Motivation for Front-end Services
1. Deploy once, update everywhere
1. Easier to organize and scale teams
1. Promotes culture of ownership, autonomy, responsibility and accountability
1. Avoid the re-write by making fewer architectural decisions that affect *everything*.
1. Testability
1. High trust, low processes
1. Granular release planning
1. Encourages re-use
1. Less framework lock-in

More on the motivation behind sofe: [https://medium.com/@blittle/a-case-for-soa-in-the-browser-f777a9f139b2](https://medium.com/@blittle/a-case-for-soa-in-the-browser-f777a9f139b2)

## Definition of a Front-end Service
1. Independently deployable
1. Not versioned in any way
1. Services are loaded at *run-time* and therefore *not* bundled into the app (services themselves can be built and bundled but are independent deployables)
1. Bounded context (100% self-contained)
1. Interaction is strictly via API

## Quick Start
1. [Setup SystemJS and JSPM](http://jspm.io/docs/getting-started.html)
2. Configure SystemJS to use the sofe plugin

  ```bash
  jspm install sofe=npm:sofe
  ```
3. Load sofe services:

  ```javascript
  //Two options for loading a sofe service called 'auth'
  import auth from 'auth!sofe'; // Will only work on non-bundled projects
  System.import('auth!sofe').then(auth => auth.doStuff()) // Works on bundled and non-bundled projects
  ```
### Demo:
Examples are available at [sofe.surge.sh](http://sofe.surge.sh) or you can run them [locally](examples/examples.md)

## sofe API

### Configuring sofe
Each deployed service has a unique name. sofe will resolve the service name into a URL where the service can be loaded.
sofe makes the resolution process flexible and configurable.

#### Automatic Resolution via NPM
By default, sofe will resolve services by assuming that the name corresponds to an npm package. If the name exists on npm,
sofe will load http://registry.npmjs.org/auth-service and find a `sofe` attribute within the `package.json` file.
The `sofe` attribute should be an object with a `url` attribute which tells sofe where to get the service deployable. The downside to automatic resolution is that for every application that loads the service (and for each other service), npm always has to be checked before the service can actually be loaded.

**Approach #1:** NPM to find urls, npmcdn.com for files

*Any* npm package can be coerced into being a sofe service, since npmcdn.com hosts all files for all npm packages. This is automatically done by sofe whenever the package.json for an npm package does not have a valid `sofe` property.

**Approach #2:** NPM to find urls, your own CDN for files

Simply put a distributable file on a CDN, modify the package.json, and publish the service to npm -- then any application can automatically resolve and load the service.

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

**How to use your own NPM registry**:
```javascript
System.config({
  sofe: {
    registry: 'https://registry.internal.canopytax.com'
  }
});
```

**Note:** Whichever version of an npm package is tagged as `latest` will be loaded by sofe.

#### Manifest Resolution (used for production workflows)
Instead of automatically resolving services, provide a manifest of services with associated service deployable locations.

**Approach #3:** Put urls to all of the source files into the `System.config`.
```javascript
System.config({
  sofe: {
    manifest: {
      "auth": "http://somelocation.com/auth.js"
    }
  }
});
```

**Approach #4:** Put a url to a manifest file (which, in turn points to the source files) into the `System.config`.
```javascript
System.config({
  sofe: {
    manifestUrl: 'https://cdn.canopytax.com/canopy-services.json'
  }
});
```

**Manifest file format:**
```json
{
  "sofe": {
    "manifest": {
      "auth": "http://somelocation.com/auth.js"
    }
  }
}
```

**Hosting the manifest file:**

If you don't want to host the manifest file yourself, it can easily be hosted by npm as a part of your `package.json`. For example, you could create an npm package (e.g., `canopy-services`) that's sole purpose is to be a sofe manifest file:

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

Using this method of hosting your manifest file, when you need to add a new service or update an existing one, simply publish a new version of `canopy-services`.

#### Browser storage resolution
**Approach #5: browser storage**

In addition to automatic resolution or manifest resolution, the urls to individual sofe services can be overridden with sessionStorage and/or localStorage. This is meant for times when you want to test out new changes to a service on an application where you can't easily change the `System.config` (i.e., you don't own the code to the application). An override is a sessionStorage/localStorage item whose key is `sofe:service-name` and whose value is a url.

Example:
```js
window.localStorage.setItem('sofe:my-service', 'http://somelocation.com/my-service.js');
// OR
window.sessionStorage.setItem('sofe:my-service', 'http://somelocation.com/my-service.js');
```

#### Resolution precedence
If there are multiple urls that a service could be resolved to, sofe will resolve the service url in the following order (highest precedence to lowest precedence):

1. Session storage
2. Local storage
3. The `manifest` property inside of the `sofe` attribute of the `System.config` or manifest file
4. The `manifestUrl` property inside of `sofe` attribute of the `System.config` or manifest file
5. The `url` property inside of the `sofe` attribute of the NPM package's package.json file
6. The `main` file inside of the NPM package's package.json file, at the `latest` version. The files themselves are retrieved from npmcdn.com.


### When to use `System.import` instead of just `import`
If your application is bundled, you must indicate that sofe services should be loaded at runtime. The following syntax is (mostly) in accordance to the whatwg/loader specification for how to asynchronously import javascript modules.
```javascript
// Utilize the sofe loader with System.js
System.import('auth!sofe')
  .then((auth) => {
    // do something with the auth service
  })
```

### When to use `import` instead of `System.import`
If your application is not bundled, you can use the `import` keyword instead of `System.import(..).then((res) => ...)`
```javascript
import auth from 'auth!sofe';
// do something with auth service
```
