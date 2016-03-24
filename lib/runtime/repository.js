var _                   = require('lodash'),
    Path                = require('path'),
    glob                = require("glob"),
    languageDefinitions = require('./language_definitions'),
    repositoryPath      = require('./repository_path');

module.exports.RepositoryConfiguration = function(config) {
  var _allFilenames;
  this.root = Path.resolve(config.root);

  this.allFilenames = function() {
    if (_.isUndefined(_allFilenames)) {
      var absoluteGlobPaths = repositoryPath.normalise(this.root, config.paths);
      var absoluteExcludeGlobPaths = repositoryPath.normalise(this.root, config.exclude);
      _allFilenames = _.difference(
        repositoryPath.expand(absoluteGlobPaths, glob.sync),
        repositoryPath.expand(absoluteExcludeGlobPaths, glob.sync)
      );
    }
    return _allFilenames;
  };

  this.isValidPath = function(path, relative) {
    if (relative) {
      path = Path.join(this.root, path);
    }
    return _.includes(this.allFilenames(), path);
  };

  this.collectCodePaths = function(language) {
    return _.filter(this.allFilenames(), function(path) {
      return _.includes(languageDefinitions.getDefinition(language), Path.extname(path).substring(1));
    });
  };
};
