var _         = require('lodash'),
    Path      = require('path'),
    filter    = require("through2-filter"),
    languages = require('../../runtime/language_definitions');

module.exports = {
  validPathFilter: function(repository) {
    return filter.obj(function(obj) {
      return _.find(repository.allFiles(), function(f) {
        return f.relativePath === obj.path;
      }) !== undefined;
    });
  },
  codeFiles: function(repository, language) {
    return _.filter(repository.allFiles(), function(f) {
      return _.includes(languages.getDefinition(language), Path.extname(f.absolutePath).substring(1));
    });
  }
};
