var _              = require('lodash'),
    Path           = require('path'),
    glob           = require('glob'),
    repositoryPath = require('./repository_path'),
    languages      = require('../runtime/language_definitions');

module.exports.RepositoryConfiguration = function(config) {
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

  var allFiles;
  var rootPath = Path.resolve(config.root);

  this.root = rootPath;
  this.allFiles = function() {
    if (_.isUndefined(allFiles)) {
      allFiles = collectAllFiles(rootPath, config.paths, config.exclude);
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
