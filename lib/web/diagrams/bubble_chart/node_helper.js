/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function(config, colorScale) {
  this.nodeWeight = function(node) {
    return node.data[config.series.calculatedWeightProperty];
  };
  this.nodeOffset = function(node) {
    return { x: node.x, y: node.y };
  };
  this.circleNodeOpacity = function(node) {
    return node.data[config.series.calculatedWeightProperty];
  };
  this.circleNodeClass = function(node) {
    return node.parent ? 'node' : 'node node--root';
  };
  this.circleNodeRadius = function(node) {
    return node.r;
  };
  this.circleTextContent = function(node) {
    if (node.data.name) {
      return node.data.name.substring(0, node.r / 3);
    }
  };
  this.selectionLinkedNodes = function(selectedNode, nodesArray) {
    var linkedPropertyValues = _.map(selectedNode.data[config.series.linkedNodesProperty], config.series.linkProperty);
    return _.filter(nodesArray, function(node) {
      return _.includes(linkedPropertyValues, node.data[config.series.linkProperty]);
    });
  };
  this.circleNodeColor = function() {
    return config.style.weightedNodeColor;
  };
  this.selectedNodeColor = function(selectedNode, node) {
    if (selectedNode === node) { return config.style.selectedNodeColor; }

    var linkDegreeValues = _.uniq(_.map(selectedNode.data[config.series.linkedNodesProperty], config.series.linkDegreeProperty));
    var linkedItem = _.find(selectedNode.data[config.series.linkedNodesProperty], function(item) {
      return item[config.series.linkProperty] === node.data[config.series.linkProperty];
    });
    var linkDegreeIndex = _.indexOf(linkDegreeValues, linkedItem[config.series.linkDegreeProperty]);
    return colorScale(linkDegreeIndex);
  };
  this.nodeTooltipTemplateArgs = function(node) {
    return [
      config.tooltipInfo.templateId,
      {
        name: node.data[config.series.nameProperty],
        data: _.map(config.tooltipInfo.templateModel, function(prop) {
          return { label: prop.label, value: node.data[prop.valueProperty] || 'n/a' };
        })
      }
    ];
  };
  this.selectedNodeTooltipTemplateArgs = function(selectedNode, node) {
    var linkedNodeProperties = _.map(config.selectedTooltipInfo.templateModel.linkedNodeProperties, function(prop) {
      return { label: prop.label, value: node.data[prop.valueProperty] || 'n/a' };
    });
    var linked = _.find(selectedNode.data[config.series.linkedNodesProperty], function(linkedItem) {
      return linkedItem[config.series.linkProperty] === node.data[config.series.linkProperty];
    });
    var selectedNodeProperties = _.map(config.selectedTooltipInfo.templateModel.selectedNodeProperties, function(prop) {
      return { label: prop.label, value: linked[prop.valueProperty] || 'n/a' };
    });
    return [
      config.selectedTooltipInfo.templateId,
      {
        name: node.data[config.series.nameProperty],
        data: linkedNodeProperties.concat(selectedNodeProperties)
      }
    ];
  };
};
//rename linkNode to linkItem
