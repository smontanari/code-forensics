var _ = require('lodash');

module.exports = function(filters) {
  this.instances = _.map(_.values(filters), 'instance');

  this.initializeFilters = function(series, model) {
    _.each(filters, function(f) {
      var filterData = (f.dataTransform || _.identity).call(null, series);
      f.instance.init(filterData);
      f.instance.outputValue.subscribe(function() {
        model.updateVisibleSeries(filters);
      });
    });
  };
};
