var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var webpack = require('webpack-stream');
var JasminePlugin = require('gulp-jasmine-browser/webpack/jasmine-plugin');


gulp.task('jasmine', function() {
var plugin = new JasminePlugin();
  return gulp.src(['lib/**/*.js', 'spec/*_helper.js', 'spec/**/*.spec.js'])
    .pipe(webpack({
      watch: true,
      output: {filename: 'all_specs.js'},
      node: { fs: "empty", beeper: false },
      plugins: [plugin]
    }))
    .on('error', function(err) {console.log(err);})
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 8888}));
});
