var fs = require('fs'),
    _  = require('lodash');

var queryEntity = function(queryFn, path) {
  try {
    return fs.statSync(path)[queryFn]();
  } catch(e) {
    if (e instanceof Error && e.code !== "ENOENT") {
      throw e;
    }
  }
  return false;
}

module.exports = {
  isFile:      _.wrap('isFile', queryEntity),
  isDirectory: _.wrap('isDirectory', queryEntity)
}
