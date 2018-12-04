/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var fancylog  = require('fancy-log'),
    chalk     = require('chalk'),
    appConfig = require('../runtime/app_config');

var log = function(msg) {
  if (appConfig.get('logEnabled')) {
    fancylog(msg);
  }
};

module.exports = {
  log: log,
  debug: function(msg, detail) { log(chalk.green(msg) + (detail || '')); },
  info: function(msg, detail) { log(chalk.yellow(msg) + (detail || '')); },
  warn: function(msg) { log(chalk.bgWhite.magenta(msg)); },
  error: function(msg) { log(chalk.bgWhite.red(msg)); }
};
