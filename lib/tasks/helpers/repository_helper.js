var _      = require('lodash'),
    Path   = require('path'),
    map    = require("through2-map"),
    filter = require("through2-filter");

module.exports = {
  validPathFilter: function(repository) {
    return filter.obj(function(obj) {
      return repository.isValidPath(obj.path);
    });
  },
  absolutePathMapper: function(repository) {
    return map.obj(function(obj) {
      return _.extend({}, obj, { path: Path.join(repository.root, obj.path) });
    });
  }
};
