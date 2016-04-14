var _                  = require('lodash'),
    WeightedCollection = require('./weighted_collection'),
    Tree               = require('./tree');

module.exports = function(rootName, nameProperty, weightOptions) {
  var tree = new Tree(rootName, nameProperty);
  var weightedData = new WeightedCollection(weightOptions.weightedProperty, weightOptions.normalised);

  this.withItem = function(item) {
    weightedData.addItem(tree.addNode(item));
  };

  this.rootNode = function() {
    weightedData.assignWeights(weightOptions.weightPropertyName);
    return tree.rootNode;
  };
};

