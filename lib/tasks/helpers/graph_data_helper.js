var _         = require('lodash'),
    graphSupport = require ('../../graph_support');

module.exports = {
  hotspotDataTree: function(reportData) {
    return _.tap(new graphSupport.WeightedTree(null, 'path', { weightedProperty: 'revisions', normalised: true }), function(tree) {
      _.each(reportData, tree.withItem.bind(tree));
    }).rootNode();
  }
};
