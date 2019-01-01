/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

 var _    = require('lodash'),
    ansi  = require('ansi-colors'),
    utils = require('../utils');

//Temporary code to warn about deprecation of MAX_CONCURRENCY
var deprecationWarning = function(msg) {
  //eslint-disable-next-line no-console
  console.log(ansi.inverse(msg));
};

module.exports = function() {
  var maxParallel = parseInt(process.env.MAX_CONCURRENCY);
  var serverPort = parseInt(process.env.SERVER_PORT);
  var codeMaatOptions = process.env.CODEMAAT_OPTS;

  //Temporary code to warn about deprecation of MAX_CONCURRENCY
  if (_.isInteger(maxParallel)) {
    deprecationWarning('The usage of the env variable ' + ansi.bold('MAX_CONCURRENCY') + ' is deprecated and will be removed in future versions.\nSet the env variable ' + ansi.bold('SERIAL_PROCESSING') +' to control concurrency.');
  }

  var getMaxConcurrency = function() {
    if (!_.isUndefined(process.env.SERIAL_PROCESSING)) return 1;
    if (_.isInteger(maxParallel)) return maxParallel;
  };

  this.getConfiguration = function() {
    return {
      maxConcurrency: getMaxConcurrency(),
      debugMode: !_.isUndefined(process.env.COMMAND_DEBUG),
      logEnabled: _.isUndefined(process.env.LOG_DISABLED),
      serverPort: _.isInteger(serverPort) ? serverPort : undefined,
      codeMaat: { options: _.isString(codeMaatOptions) ? utils.arrays.arrayPairsToObject(codeMaatOptions.split(' ')) : {} }
    };
  };
};
