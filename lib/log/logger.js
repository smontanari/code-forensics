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
  debug: function(msg, detail) { log(chalk.green(msg) + detail); },
  info: function(msg, detail) { log(chalk.yellow(msg) + chalk.grey(detail)); },
  warn: function(msg) { log(chalk.bgYellow.magenta(msg)); },
  error: function(msg) { log(chalk.bgWhite.red(msg)); }
};
