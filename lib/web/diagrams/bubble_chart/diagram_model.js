/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

var NodeHelper     = require('./node_helper.js');
var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, nodesArray) {
  var colorScale = configuration.colorScaleFactory(nodesArray);
  var nodeHelper = new NodeHelper(configuration, colorScale);

  var currentSelection;
  var selectedNodes = [];

  this.rootNode = nodesArray[0];
  this.visibleSeries = ko.observable(nodesArray);
  this.updateVisibleSeries = function(filters) {
    this.visibleSeries(_.filter(nodesArray, function(node){
      var nodeWeight = nodeHelper.nodeWeight(node);
      var isNodeAboveWeightThreshold = _.isUndefined(nodeWeight) || (_.isNumber(nodeWeight) && nodeWeight >= filters.weightFilter.outputValue());

      var isNodeAboveValueThreshold = _.isNumber(node.value) && node.value >= filters.valueFilter.outputValue();

      return node.isRoot() || (isNodeAboveWeightThreshold && isNodeAboveValueThreshold);
    }));
  };
  this.selectNode = function(targetNode) {
    if (currentSelection === targetNode) {
      selectedNodes = [];
      currentSelection = undefined;
    } else {
      selectedNodes = nodeHelper.selectionLinkedNodes(targetNode, nodesArray);
      currentSelection = targetNode;
    }
  };

  var nodeSelected = function(node) {
    return currentSelection ===  node || _.includes(selectedNodes, node);
  };

  var nodeClass = function(node) {
    var baseClass = nodeHelper.circleNodeClass(node);
    if (nodeSelected(node)) { baseClass += ' selected'; }
    return baseClass;
  };

  var nodeFillOpacity = function(node) {
    return nodeSelected(node) ? 1 : nodeHelper.circleNodeOpacity(node);
  };

  var nodeFillColor = function(node) {
    if (nodeSelected(node)) {
      return nodeHelper.selectedNodeColor(currentSelection, node);
    } else if (node.parent) {
      return nodeHelper.circleNodeColor(node);
    }
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: {
          viewBox: '0 0 ' + configuration.style.diameter + ' ' + configuration.style.diameter
        }
      },
      components: [
        {
          name: 'node-data',
          componentType: 'data',
          series: nodesArray,
          graphicElements: [
            {
              elementType: 'circle',
              properties: {
                offset: nodeHelper.nodeOffset,
                attributes: {
                  class: nodeClass,
                  r: nodeHelper.circleNodeRadius
                },
                style: { fill: nodeFillColor, 'fill-opacity': nodeFillOpacity }
              },
              tooltip: {
                class: 'circle-packing-diagram',
                html: function(_event, node) {
                  var args = nodeSelected(node) && currentSelection !== node ? nodeHelper.selectedNodeTooltipTemplateArgs(currentSelection, node) : nodeHelper.nodeTooltipTemplateArgs(node);
                  return mustacheHelper.renderTemplate.apply(null, args);
                },
                allowDisable: configuration.tooltip.disableOnDeactivation
              }
            },
            {
              elementType: 'text',
              properties: {
                attributes: { class: 'label' },
                offset: nodeHelper.nodeOffset,
                text: nodeHelper.circleTextContent
              }
            }
          ]
        }
      ],
      updateStrategy: {
        components: [
          {
            name: 'node-data',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'circle',
                properties: {
                  attributes: { class: nodeClass },
                  style: { fill: nodeFillColor, 'fill-opacity': nodeFillOpacity }
                }
              }
            ]
          }
        ]
      }
    }
  ];
};
