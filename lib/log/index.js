/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ansi      = require('ansi-colors'),
    moment    = require('moment'),
    appConfig = require('../runtime/app_config');

var log = function() {
  if (appConfig.get('logEnabled')) {
    var time = moment().format('[[]HH:mm:ss[]] ');
    process.stdout.write(time);
    console.log.apply(console, arguments); //eslint-disable-line no-console
  }
};

module.exports = {
  log: log,
  debug: function(msg, detail) { log(ansi.green(msg) + (detail || '')); },
  info: function(msg, detail) { log(ansi.yellow(msg) + (detail || '')); },
  warn: function(msg) { log(ansi.magenta(msg)); },
  error: function(msg) { log(ansi.red(msg)); }
  // warn: function(msg) { log(ansi.bgWhite.magenta(msg)); },
  // error: function(msg) { log(ansi.bgWhite.red(msg)); }
};
