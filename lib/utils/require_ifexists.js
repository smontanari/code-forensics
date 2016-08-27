var Path  = require('path'),
    chalk = require('chalk'),
    log   = require('./log');

module.exports = function(currentPath, modulePath) {
  var path = Path.join(currentPath, modulePath);
  try {
    return require(path);
  } catch(e) {
    if (e instanceof Error && e.code !== "MODULE_NOT_FOUND") {
      log(chalk.red('Required module not found: ' + path));
      throw e;
    }
  }
};
