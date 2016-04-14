var _         = require('lodash'),
    graphSupport = require ('../../graph_support');

module.exports = {
  hotspotDataTree: function(repository, reportData) {
    return _.tap(new graphSupport.WeightedTree(repository.root, 'path', { weightedProperty: 'revisions', normalised: true }), function(tree) {
      _.each(reportData, tree.withItem.bind(tree));
    }).rootNode();
  }
};
