#!/usr/bin/env node

var path           = require('path'),
    Jasmine        = require('jasmine');
    JasmineCommand = require('jasmine/lib/command');

var argv = process.argv.slice(2);

var testRunner = new Jasmine();
var command = new JasmineCommand(path.resolve());

if (require('minimist')(argv).verbose) {
  var SpecReporter = require('jasmine-spec-reporter');
  testRunner.configureDefaultReporter({print: function() {}});
  testRunner.addReporter(new SpecReporter());
}

command.run(testRunner, argv);
