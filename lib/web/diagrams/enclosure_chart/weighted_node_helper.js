/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

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
    if (this.nodeWeight(node) > 0.0) { return this.config.style.weightedNodeColor; }

    return BaseNodeHelper.prototype.circleNodeFill.call(this, node);
  },
  circleNodeOpacity: function(node) {
    if (this.nodeHiglighted(node)) { return 1; }
    return this.nodeWeight(node);
  },
  textNodeClass: function(node) {
    var labelClasses = BaseNodeHelper.prototype.textNodeClass.call(this, node);
    if (node.isLeaf() && this.nodeWeight(node) > 0.4) {
      labelClasses = [labelClasses, 'label-heavy'].join(' ');
    }
    return labelClasses;
  }
});

module.exports = NodeHelper;
