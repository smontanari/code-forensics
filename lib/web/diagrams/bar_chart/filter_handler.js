var _ = require('lodash');

module.exports = function(filters) {
  this.bindTo = function(model) {
    filters.dataFilter.outputValue.subscribe(function() {
      model.visibleSeries(_.filter(model.series, filters.dataFilter.applyToObject));
    });
  };
};
