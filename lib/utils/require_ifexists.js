var Path = require('path');

module.exports = function(currentPath, modulePath) {
  try {
    return require(Path.join(currentPath, modulePath));
  } catch(e) {
    if (e instanceof Error && e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }
};
