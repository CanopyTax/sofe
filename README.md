# sofe
Service Oriented Front-end - Sofe is a [SystemJS](https://github.com/systemjs/systemjs) plugin that resolves a module name to a fully qualified url at runtime.

[![npm version](https://img.shields.io/npm/v/sofe.svg?style=flat-square)](https://www.npmjs.org/package/sofe)
[![Build Status](https://img.shields.io/travis/CanopyTax/sofe.svg?style=flat-square)](https://travis-ci.org/CanopyTax/sofe)
[![Code Coverage](https://img.shields.io/codecov/c/github/CanopyTax/sofe.svg?style=flat-square)](https://codecov.io/github/CanopyTax/sofe)

Sofe allows developers to avoid building monolothic front-end web applications and instead build software on top of micro-services. Sofe is a JavaScript library that enables independently deployable JavaScript services to be retrieved at run-time in the browser.

More on the [motivation for SOA in the browser](docs/motivation.md)

### Getting Started
1. [Setup SystemJS and JSPM](http://jspm.io/docs/getting-started.html)
2. Configure SystemJS to use the sofe plugin:

  ```bash
  jspm install npm:sofe
  ```
3. Load sofe services:

  ```javascript
  System.import('sofe-hello-world!sofe')
    .then(hello => hello())
  // Sofe is properly setup if the browser alerts a hello world.
  // You have successfully loaded the hello-world sofe service.
  ```
  By default, any npm package with a UMD build can be a sofe service. Simply load the service by the package name:

  ```javascript
  System.import('backbone!sofe')
    .then(Backbone => new Backbone.View({}));
  ```

### Create your own service
By default, all npm packages are loaded through npm ([unpkg](https://unpkg.com)). While this is convenient, it isn't always
what you want to do for your own services. You can provide a custom location for where your service distributable is located
by adding a `sofe` property to your package.json:
```javascript
{
  "name": "my-service",
  "version": "1.0.0",
  "sofe": {
    "url": "https://cdn.some-location.com/my-service-1.0.0.js"
  }
}
```
Republish a new sofe URL to npm whenever you want to update the location of your service distributable.

### Services in production
Create your own private service by telling sofe how to resolve your service name. Add to your systemjs configuration a manifest
option to a sofe property or auto-discover services by loading a remote manifest of available services:
```javascript
System.config({
  sofe: {
    manifest: {
      "someInternalService": "http://somelocation.com/service-1.0.0.js"
    },
    manifestUrl: 'https://somelocation.com/available-services.json'
  }
});
```

Learn more about production configuration within the [API documentation](docs/sofe-api.md)

### Examples
Examples are available at [sofe.surge.sh](http://sofe.surge.sh) or you can run them [locally](examples/examples.md)

### Tools
1. [sofe-inspector](https://github.com/CanopyTax/sofe-inspector) - Developer tool for inspecting and overriding available sofe services
1. [sofe-babel-plugin](https://github.com/CanopyTax/sofe-babel-plugin) - A babel plugin for production sofe workflows with webpack
1. [sofe-deplanifester](https://github.com/CanopyTax/sofe-deplanifester) - A manifest deployment service for sofe
1. [sofe-hello-world](https://github.com/CanopyTax/sofe-hello-world) - A simple sofe-service to say hello

### License
Copyright 2016 CanopyTax

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
