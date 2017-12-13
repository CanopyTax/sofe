SystemJS.config({
  browserConfig: {
    "paths": {
      "npm:": "./jspm_packages/npm/",
      "github:": "./jspm_packages/github/",
      "static/": "/src/"
    }
  },
  nodeConfig: {
    "paths": {
      "npm:": "jspm_packages/npm/",
      "github:": "jspm_packages/github/",
      "static/": "src/"
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.21"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "static": {
      "main": "static.js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
	meta: {
		"*.service": { loader: 'sofe' }
	},
  map: {
    "css": "github:systemjs/plugin-css@0.1.33",
    "sofe": "/src/sofe.js"
  },
  packages: {}
});

SystemJS.config({
	sofe: {
		manifest: {
			"auth.service":"/examples/services/local.js",
			"auth":"/examples/services/local.js"
		}
	}
});
