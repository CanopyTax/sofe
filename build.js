var rollup = require('rollup').rollup;
var npm = require('rollup-plugin-npm');
var commonjs = require('rollup-plugin-commonjs');

rollup({
	entry: './lib/sofe.js',
	plugins: [
		npm({
			// use "jsnext:main" if possible
			// – see https://github.com/rollup/rollup/wiki/jsnext:main
			jsnext: true,

			// use "main" field or index.js, even if it's not an ES6 module
			// (needs to be converted from CommonJS to ES6
			// – see https://github.com/rollup/rollup-plugin-commonjs
			main: true

			// if there's something your bundle requires that you DON'T
			// want to include, add it to 'skip'
			// skip: [ 'some-big-dependency' ],
		}),
		commonjs()
	]
}).then( function(bundle) {
	bundle.write({ dest: 'dist/sofe.js', format: 'cjs' })
});
