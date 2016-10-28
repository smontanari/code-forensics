var _    = require('lodash'),
    fs   = require('fs'),
    Path = require('path'),
    glob = require('glob');

module.exports = {
  makeGlob: function(path) {
    //TODO: fix bug: if path has no glob and doesn't exist this blows up
    if (!glob.hasMagic(path) && fs.statSync(path).isDirectory()) {
      return Path.join(path, '**/*.*');
    } else {
      return path;
    }
  },
  expand: function(originalPaths, expander) {
    return _.reduce(originalPaths, function(array, path) { return array.concat(expander(path)); }, []);
  },
  normalise: function(absoluteRootPath, paths) {
    var self = this;
    return _.map(
      _.map(paths, function(p) { return Path.join(absoluteRootPath, p); }),
      self.makeGlob
    );
  },
  relativise: function(absoluteRootPath, path) {
    var rootPath = absoluteRootPath.endsWith('/') ? absoluteRootPath : absoluteRootPath.concat('/');
    if (path.startsWith(rootPath)) {
      return path.substring(rootPath.length);
    }
    return path;
  }
};
