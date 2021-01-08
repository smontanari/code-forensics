/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    d3 = require('d3');

module.exports = function(config) {
  var self = this;
  var width = config.style.width - config.style.margin.left - config.style.margin.right,
      height = config.style.height - config.style.margin.top - config.style.margin.bottom;

  var horizontalScale = d3.scaleLinear().range([0, width]);
  var verticalScale = d3.scaleLinear().range([0, height]);

  this.setNodeScale = function(node) {
    horizontalScale.domain([node.x0, node.x1]);
    verticalScale.domain([node.y0, node.y1]);
  };

  this.hasLeafChildren = function(node) {
    return node.children && _.every(node.children, function(n) { return !n.children; });
  };

  this.nodeTitle = function(node) {
    return node.data.name + ' (' + node.value + ')';
  };

  this.nodeParentName = function(node) {
    if (node.parent) {
      var parentName = self.nodeParentName(node.parent);
      return parentName ? parentName + '/' + node.data.name : node.data.name;
    }
  };

  this.nodeHorizontalCoordinate = function(node) {
    return horizontalScale(node.x0);
  };

  this.nodeVerticalCoordinate = function(node) {
    return verticalScale(node.y0);
  };

  this.nodeWidth = function(node) {
    return horizontalScale(node.x1) - horizontalScale(node.x0);
  };

  this.nodeTextHorizontalCoordinate = function(node) {
    return self.nodeHorizontalCoordinate(node) + 5;
  };

  this.nodeTextVerticalCoordinate = function(node) {
    return self.nodeVerticalCoordinate(node) + 5;
  };

  this.nodeHeight = function(node) {
    return verticalScale(node.y1) - verticalScale(node.y0);
  };

  this.nodeInnerText1 = function(node) {
    if (node.children) {
      if (this.getBBox().height > verticalScale(node.y1) - verticalScale(node.y0)) { return; }
      var s = node.data.name;
      if (this.getBBox().width > horizontalScale(node.x1) - horizontalScale(node.x0)) {
        var trimRatio = (this.getBBox().width - (horizontalScale(node.x1) - horizontalScale(node.x0)))/this.getBBox().width;
        var trimChars = Math.ceil(s.length * trimRatio);
        s = s.slice(0, -(trimChars + 1));
      }
      return s;
    }
    return node.data.name;
  };

  this.nodeInnerText2 = function(node) {
    if (!node.children) return node.value;
  };
};
