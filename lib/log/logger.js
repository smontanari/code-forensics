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
  error: function(msg) { log(chalk.red(msg)); }
};
