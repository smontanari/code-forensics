var _                 = require('lodash'),
    objectTransformer = require('./object_transformer');

module.exports = {
  extension: function(transformOption) {
    return function(reportItem, dataSourceItem) {
      _.extend(reportItem, objectTransformer(dataSourceItem, transformOption));
    };
  }
};
