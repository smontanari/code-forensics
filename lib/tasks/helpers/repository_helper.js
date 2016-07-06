var _      = require('lodash'),
    Path   = require('path'),
    map    = require("through2-map"),
    filter = require("through2-filter");

module.exports = {
  validPathFilter: function(repository) {
    return filter.obj(function(obj) {
      return repository.isValidPath(obj.path, true);
    });
  }
};
