var _ = require('lodash');

module.exports = function(filters, nodeProxy) {
  this.bindTo = function(model) {
    filters.valueFilter.range.max = nodeProxy.nodeValue(_.maxBy(model.nodesArray, nodeProxy.nodeValue));
    _.each([filters.valueFilter, filters.weightFilter], function(f) {
      f.outputValue.subscribe(function() {
        model.visibleNodes(_.filter(
          model.nodesArray,
          _.partial(nodeProxy.nodeVisible, filters.weightFilter.outputValue(), filters.valueFilter.outputValue())
        ));
      });
    });
  };
};
