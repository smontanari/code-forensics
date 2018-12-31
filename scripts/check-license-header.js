#!/usr/bin/env node

var fs       = require('fs'),
    Bluebird = require('bluebird'),
    readline = require('readline'),
    ansi     = require('ansi-colors'),
    glob     = require('glob');

var FileData = function(pathname) {
  var CHECK_REGEXP = /Copyright \(C\) \d+-\d+ Silvio Montanari/;
  var lineCounter = 0;

  this.scan = function() {
    var inputStream = fs.createReadStream(pathname);
    var rl = readline.createInterface({ input: inputStream });
    return new Bluebird(function(resolve) {
      rl.on('line', function(line) {
        lineCounter++;
        if (lineCounter === 3) {
          resolve({ path: pathname, check: CHECK_REGEXP.test(line) });
          rl.close();
        }
      });
    });
  };
};

Bluebird.map(glob.sync('{./lib/**/*.js,./public/styles/**/*.less}'), function(filePath) {
  return new FileData(filePath).scan();
}).then(function(results) {
  var invalidFiles = results.filter(function(r) { return r.check === false; });
  /*eslint-disable no-console, no-process-exit*/
  if (invalidFiles.length > 0) {
    console.log('Missing header licensing in files: ');
    invalidFiles.forEach(function(file) {
      console.log(ansi.red(file.path));
    });
    process.exit(1);
  }
  /*eslint-disable no-console, no-process-exit*/
});
