var _            = require('lodash'),
    graphSupport = require ('../../graph_support');

module.exports = {
  weightedTree: function(reportData, weightedPropertyName) {
    return _.tap(new graphSupport.WeightedTree(null, 'path', { weightedProperty: weightedPropertyName, normalised: true }), function(tree) {
      _.each(reportData, tree.withItem.bind(tree));
    }).rootNode();
  }
};
