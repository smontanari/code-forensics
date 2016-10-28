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

  this.tree = function(reportData, treePathPropertyName, nodeChildrenPropertyName) {
    var tree = new graphSupport.Tree(null, treePathPropertyName);
    _.each(reportData, function(item) {
      var treeItem = _.assign(
        _.omit(item, nodeChildrenPropertyName),
        { children: item[nodeChildrenPropertyName] }
      );
      tree.addNode(treeItem);
    });

    return tree.rootNode;
  };
};
