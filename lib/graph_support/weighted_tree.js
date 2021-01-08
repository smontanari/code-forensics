/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var WeightedCollection = require('./weighted_collection'),
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
