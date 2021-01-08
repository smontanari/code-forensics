/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _     = require('lodash'),
    Path  = require('path'),
    glob  = require('glob'),
    utils = require('../utils');

module.exports = {
  makeGlob: function(path) {
    if (!glob.hasMagic(path) && utils.fileSystem.isDirectory(path)) {
      return Path.join(path, '**/*');
    } else {
      return path;
    }
  },
  expand: function(originalPaths, expander) {
    return _.reduce(originalPaths, function(array, path) {
      var expandedPaths = _.filter(expander(path), function(p) {
        return utils.fileSystem.isFile(p);
      });
      return array.concat(expandedPaths);
    }, []);
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
