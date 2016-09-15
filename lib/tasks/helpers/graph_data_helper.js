var _            = require('lodash'),
    graphSupport = require ('../../graph_support');

module.exports = function() {
  this.weightedTree = function(reportData, treePathPropertyName, weightedPropertyName) {
    return _.tap(new graphSupport.WeightedTree(null, treePathPropertyName, { weightedProperty: weightedPropertyName, normalised: true }), function(tree) {
      _.each(reportData, tree.withItem.bind(tree));
    }).rootNode();
  };

  this.flatWeightedTree = function(reportData, weightedPropertyName) {
    var weightedList = new graphSupport.WeightedCollection(weightedPropertyName, true);
    _.each(reportData, weightedList.addItem);
    weightedList.assignWeights();

    return { children: reportData };
  };
};
