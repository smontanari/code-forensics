/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    Path              = require('path'),
    glob              = require('glob'),
    repositoryPath    = require('./repository_path'),
    languages         = require('./language_definitions'),
    CFValidationError = require('./validation_error'),
    utils             = require('../utils');

var validateConfig = function(config) {
  if (_.isUndefined(config.rootPath)) {
    throw new CFValidationError('Missing required repository configuration property: rootPath');
  }
  if (!utils.fileSystem.isDirectory(config.rootPath)) {
    throw new CFValidationError('Repository root directory does not exist: ' + config.rootPath);
  }
};

module.exports = function(config) {
  var configuration = _.defaults({}, config, { includePaths: ['**/*'], excludePaths: [] });
  validateConfig(configuration);

  var allFiles;
  var rootPath = configuration.rootPath;

  var collectAllFiles = function(rootPath, includePaths, excludePaths) {
    var absoluteGlobPaths = repositoryPath.normalise(rootPath, includePaths);
    var absoluteExcludeGlobPaths = repositoryPath.normalise(rootPath, excludePaths);
    var allAbsoluteFilenames = _.difference(
      repositoryPath.expand(absoluteGlobPaths, glob.sync),
      repositoryPath.expand(absoluteExcludeGlobPaths, glob.sync)
    );

    return _.map(allAbsoluteFilenames, function(path) {
      return {
        absolutePath: path,
        relativePath: repositoryPath.relativise(rootPath, path)
      };
    });
  };

  this.rootPath = rootPath;
  this.allFiles = function() {
    if (_.isUndefined(allFiles)) {
      allFiles = collectAllFiles(rootPath, configuration.includePaths, configuration.excludePaths);
    }
    return allFiles;
  };

  this.isValidPath = function(path) {
    return _.find(this.allFiles(), function(f) {
      return f.relativePath === path;
    }) !== undefined;
  };

  this.sourceFiles = function(language) {
    return _.filter(this.allFiles(), function(f) {
      return _.includes(languages.getDefinition(language), Path.extname(f.absolutePath).substring(1));
    });
  };
};
