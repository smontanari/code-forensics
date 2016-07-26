var _ = require('lodash');

module.exports = function(filters, nodeHelper) {
  this.bindTo = function(model) {
    filters.valueFilter.range.max = nodeHelper.nodeValue(_.maxBy(model.nodesArray, nodeHelper.nodeValue));
    _.each([filters.valueFilter, filters.weightFilter], function(f) {
      f.outputValue.subscribe(function() {
        model.visibleNodes(_.filter(
          model.nodesArray,
          _.partial(nodeHelper.nodeVisible, filters.weightFilter.outputValue(), filters.valueFilter.outputValue())
        ));
      });
    });
  };
};
