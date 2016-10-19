var fs = require('fs'),
    _  = require('lodash'),
    Q  = require('q');

var queryEntity = function(queryFn, path) {
  try {
    return fs.statSync(path)[queryFn]();
  } catch(e) {
    if (e instanceof Error && e.code !== 'ENOENT') {
      throw e;
    }
  }
  return false;
};

module.exports = {
  isFile:      _.wrap('isFile', queryEntity),
  isDirectory: _.wrap('isDirectory', queryEntity),
  writeToFile: function(filepath, content) {
    return Q.nfcall(fs.writeFile, filepath, content);
  }
};
