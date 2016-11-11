var Q  = require('q'),
    _  = require('lodash');

var defaultLayoutAdapter = { toSeries: Q };

module.exports = function(layoutAdapter, dataTransform) {
  var adapter = layoutAdapter || defaultLayoutAdapter;
  var transformFn = dataTransform || _.identity;

  this.processData = function(data) {
    return adapter.toSeries(data).then(transformFn);
  };
};
