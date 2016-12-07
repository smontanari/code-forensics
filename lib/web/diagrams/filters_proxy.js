var _ = require('lodash');

module.exports = function(filters) {
  var groupedInstances = function() {
    return _.reduce(_.groupBy(_.values(filters), 'group'), function(acc, filters, group) {
      var availableFilters = _.filter(_.map(filters, 'instance'), _.method('hasData'));
      if (availableFilters.length > 0) { acc[group] = availableFilters; }
      return acc;
    }, {});
  };

  this.initializeFilters = function(series, model) {
    _.each(filters, function(f) {
      var filterData = (f.dataTransform || _.identity).call(null, series);
      f.instance.init(filterData);
      f.instance.outputValue.subscribe(function() {
        model.applyFilters(filters, f);
      });
    });
    return groupedInstances();
  };
};
