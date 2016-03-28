# sofe
Service Oriented Front-end

[![npm version](https://img.shields.io/npm/v/sofe.svg?style=flat-square)](https://www.npmjs.org/package/sofe)
[![Build Status](https://img.shields.io/travis/CanopyTax/sofe.svg?style=flat-square)](https://travis-ci.org/CanopyTax/sofe)
[![Code Coverage](https://img.shields.io/codecov/c/github/CanopyTax/sofe.svg?style=flat-square)](https://codecov.io/github/CanopyTax/sofe)

Sofe allows developers to avoid building monolothic front-end web applications and instead build software on top of micro-services. Sofe is a JavaScript library that enables independently deployable JavaScript services to be retrieved at run-time in the browser.

### Getting Started
1. [Setup SystemJS and JSPM](http://jspm.io/docs/getting-started.html)
2. Configure SystemJS to use the sofe plugin

  ```bash
  jspm install sofe=npm:sofe
  ```
3. Load sofe services:

  ```javascript
  System.import('sofe-hello-world!sofe')
    .then(hello => hello())
  // Sofe is properly setup if the browser alerts a hello world.
  // You have successfully loaded the hello-world sofe service.
  ```

### More Information
1. [Why SOA in the browser?](docs/motivation.md)
1. [Sofe API and configuration](docs/sofe-api.md)
1. Examples are available at [sofe.surge.sh](http://sofe.surge.sh) or you can run them [locally](examples/examples.md)
1. [Extra tools](docs/tools.md)
