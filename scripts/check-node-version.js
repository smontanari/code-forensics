#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var semver = require('semver');
var packageConfig = require(path.join(__dirname,'..', 'package.json'));

function verifyTargetVersion(target) {
  _.each(packageConfig.dependencies, function(depVersion, depName) {
    var package = require(path.join(__dirname, '..', 'node_modules', depName, 'package.json'));
    var requiredVersion = _.property('engines.node')(package);
    if (requiredVersion && requiredVersion !== '*') {
      if (!semver.satisfies(target, requiredVersion)) {
        console.log(package.name + ': ' + requiredVersion);
      }
    }
  });
}

var args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a target NodeJS version to check against');
  process.exit(1);
}

verifyTargetVersion(semver.coerce(args[0]));
