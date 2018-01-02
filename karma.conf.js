// Karma configuration
// Generated on Fri Dec 18 2015 13:09:54 GMT-0700 (MST)

module.exports = function(config) {
  config.set({

    // plugins: [
    //   'karma-chrome-launcher',
    //   'karma-phantomjs-launcher',
    //   'karma-jasmine',
    //   'karma-coverage',
    //   'karma-babel-preprocessor'
    // ],

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      { pattern: 'node_modules/path-browserify/**/*.js', watched: false, included: false, served: true},
      { pattern: 'src/**/*.*', watched: true, included: false, served: true},
      { pattern: 'test/**/*', watched: true, included: false, served: true},
      'test/**/*.test.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.*': ['babel', 'coverage'],
      'test/**/*.js': ['babel']
    },

    'babelPreprocessor': {
      options: {
        presets: ['es2015', 'stage-0']
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,

    coverageReporter: {
      // configure the reporter to use isparta for JavaScript coverage
      // Only on { "karma-coverage": "douglasduteil/karma-coverage#next" }
      instrumenters: { isparta : require('isparta') },
      instrumenter: {
        'src/**/*.*': 'isparta'
      },
      instrumenterOptions: {
        isparta: { babel : { presets: 'es2015' } }
      },
      reporters: [
        {
          type: 'text'
        },
        {
          type: 'json',
          dir : 'coverage/',
          file : 'coverage.txt'
        }
      ]
    },

    proxies: {
    }
  })
}
