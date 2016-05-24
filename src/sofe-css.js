import Plugins from 'jspm-loader-css/src/plugins.js'
import Loader from 'jspm-loader-css/src/loader.js'

import { normalize, locate as _locate } from './hooks.js';

const plugins = [
  Plugins.default.values,
  Plugins.default.localByDefault,
  Plugins.default.extractImports,
  Plugins.default.scope
];

const loader = new Loader.default(plugins);

function fetch() {
	return loader.fetch.apply(this, arguments);
}

function bundle() {
	return loader.bundle.apply(this, arguments);
}

export {fetch, bundle};
