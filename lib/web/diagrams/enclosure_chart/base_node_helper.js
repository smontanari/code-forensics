/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var ColorScaleFactory = require('../../utils/color_scale_factory.js');

var BaseNodeHelper = function(config) {
  this.config = config;
  this.colorScale = ColorScaleFactory.gradientLinear([-1, 5], config.style.nodeDepthColorRange);
};

BaseNodeHelper.prototype = Object.create(
  {
    nodeValue: function(node) {
      return node.data[this.config.series.valueProperty];
    },
    nodeOffset: function(node) {
      return { x: node.x, y: node.y };
    },
    circleNodeFill: function(node) {
      if (node.children) { return this.colorScale(node.depth); }
    },
    circleNodeOpacity: function() {
      return 1;
    },
    circleNodeClass: function(node) {
      return node.isRoot() ? 'node node-root' : node.isLeaf() ? 'node node-leaf' : 'node';
    },
    circleNodeRadius: function(node) {
      return node.r;
    },
    textNodeOpacity: function(parentNode, node) {
      var textVisible = (
        this.nodeFocused(parentNode, node) &&
        (this.nodeValue(node) && this.nodeValue(node) > 0 || node.children)
      );
      return textVisible ? 1 : 0;
    },
    textNodeContent: function(node) {
      return node.data.name; //use nameProperty
    },
    textNodeClass: function(node) {
      var labelClasses = ['label'];
      if (node.children) {
        labelClasses.push('label-parent');
      } else {
        labelClasses.push('label-leaf');
      }
      return labelClasses.join(' ');
    },
    nodeFocused: function(focus, node) {
      return focus === null || focus === undefined || node.parent === focus;
    },
    nodeTooltipTemplateArgs: function(node) {
      return [
        this.config.tooltipInfo.templateId,
        {
          name: node.fullName(),
          data: _.map(this.config.tooltipInfo.templateProperties, function(prop) {
            return { label: prop.label, value: node.data[prop.valueProperty] || 'n/a' };
          })
        }
      ];
    }
  }
);

module.exports = BaseNodeHelper;
