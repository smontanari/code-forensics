#!/usr/bin/env node

var path           = require('path'),
    Jasmine        = require('jasmine'),
    JasmineCommand = require('jasmine/lib/command'),
    SpecReporter   = require('jasmine-spec-reporter').SpecReporter;

var argv = process.argv.slice(2);

var testRunner = new Jasmine();
var command = new JasmineCommand(path.resolve());

if (require('minimist')(argv).verbose) {
  argv.shift();
  testRunner.env.clearReporters();
  testRunner.addReporter(new SpecReporter({
    displayStacktrace: 'all',
    displayPendingSpec: true,
    displaySpecDuration: true
  }));
}
testRunner.loadConfigFile();

command.run(testRunner, argv);
