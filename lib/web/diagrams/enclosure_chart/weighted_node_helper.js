var _  = require('lodash');

var BaseNodeHelper = require('./base_node_helper.js');

var NodeHelper = function(config) {
  BaseNodeHelper.call(this, config);
};

NodeHelper.prototype = Object.create(BaseNodeHelper.prototype);

_.extend(NodeHelper.prototype, {
  nodeHiglighted: function(node) {
    return this.config.style.nodeHighlight && node.fullName() === this.config.style.nodeHighlight.name;
  },
  nodeWeight: function(node) {
    return node.data[this.config.series.calculatedWeightProperty];
  },
  circleNodeFill: function(node) {
    if (this.nodeHiglighted(node)) { return this.config.style.nodeHighlight.color; }
    if (node.data[this.config.series.calculatedWeightProperty] > 0.0) { return this.config.style.weightedNodeColor; }

    return BaseNodeHelper.prototype.circleNodeFill.call(this, node);
  },
  circleNodeOpacity: function(node) {
    if (this.nodeHiglighted(node)) { return 1; }
    return node.data[this.config.series.calculatedWeightProperty];
  },
  textNodeClass: function(node) {
    var labelClasses = BaseNodeHelper.prototype.textNodeClass.call(this, node);
    if (node.isLeaf() && node.data[this.config.series.calculatedWeightProperty] > 0.4) {
      labelClasses = [labelClasses, 'label-heavy'].join(' ');
    }
    return labelClasses;
  }
});

module.exports = NodeHelper;
