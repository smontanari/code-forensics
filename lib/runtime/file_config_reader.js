/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path          = require('path'),
    fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    chalk         = require('chalk'),
    utils         = require('../utils');

//Temporary code to warn about deprecation of MAX_CONCURRENCY
var deprecationWarning = function(msg) {
  //eslint-disable-next-line no-console
  console.log(chalk.inverse(msg));
};

module.exports = function() {
  var file = Path.resolve('.code-forensics');
  var decoder = new StringDecoder();

  this.getConfiguration = function() {
    if (utils.fileSystem.isFile(file)) {
      var config = JSON.parse(decoder.write(fs.readFileSync(file)));
      //Temporary code to warn about deprecation of MAX_CONCURRENCY
      if (config.maxConcurrency) {
        deprecationWarning('The usage of property ' + chalk.bold('maxConcurrency') + ' is deprecated and will be removed in future versions.\nSet the property ' + chalk.bold('serialProcessing') + ' to true to control concurrency.');
      }
      if (config.serialProcessing) {
        config.maxConcurrency = 1;
      }
      return config;
    }
    return {};
  };
};
