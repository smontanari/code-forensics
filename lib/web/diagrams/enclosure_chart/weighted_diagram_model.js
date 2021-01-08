/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

var WeightedNodeHelper = require('./weighted_node_helper.js'),
    mustacheHelper     = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, nodesArray) {
  var self = this;
  var nodeHelper = new WeightedNodeHelper(configuration);
  this.rootNode = nodesArray[0];
  this.currentFocus = this.rootNode;

  var visibleSeries = ko.observable(nodesArray);
  this.applyFilters = function(filters) {
    visibleSeries(_.filter(nodesArray, function(node) {
      var nodeWeight = nodeHelper.nodeWeight(node);
      var nodeValue = nodeHelper.nodeValue(node);

      var isNodeAboveWeightThreshold = _.isUndefined(nodeWeight) || (_.isNumber(nodeWeight) && nodeWeight >= filters.weightFilter.instance.outputValue());
      var isNodeAboveValueThreshold = _.isUndefined(nodeValue) || (_.isNumber(nodeValue) && nodeValue >= filters.valueFilter.instance.outputValue());

      return node.isRoot() || (isNodeAboveWeightThreshold && isNodeAboveValueThreshold);
    }));
  };

  this.onModelChange = function(listener) {
    visibleSeries.subscribe(listener);
  };

  var nodeVisible = function(node) {
    return nodeHelper.nodeHiglighted(node) || _.includes(visibleSeries(), node);
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
          properties: {
            offset: { x: configuration.style.diameter / 2, y: configuration.style.diameter / 2 }
          },
          graphicElements: [
            {
              elementType: 'circle',
              properties: {
                offset: nodeHelper.nodeOffset.bind(nodeHelper),
                attributes: {
                  class: nodeHelper.circleNodeClass.bind(nodeHelper),
                  r: nodeHelper.circleNodeRadius.bind(nodeHelper)
                },
                style: {
                  display: function(node) { return nodeVisible(node) ? 'block' : 'none'; },
                  fill: nodeHelper.circleNodeFill.bind(nodeHelper),
                  'fill-opacity': nodeHelper.circleNodeOpacity.bind(nodeHelper)
                }
              },
              tooltip: {
                class: 'circle-packing-diagram',
                html: function(_event, node) {
                  return mustacheHelper.renderTemplate.apply(null, nodeHelper.nodeTooltipTemplateArgs(node));
                },
                actions: {
                  show: {
                    event: 'mouseover',
                    condition: function(node) {
                      return nodeHelper.nodeFocused(self.currentFocus, node) && node.isLeaf();
                    }
                  }
                }
              }
            }
          ]
        },
        {
          name: 'text-data',
          componentType: 'data',
          series: nodesArray,
          properties: {
            offset: { x: configuration.style.diameter / 2, y: configuration.style.diameter / 2 }
          },
          graphicElements: [
            {
              elementType: 'text',
              properties: {
                offset: nodeHelper.nodeOffset.bind(nodeHelper),
                attributes: { class: nodeHelper.textNodeClass.bind(nodeHelper) },
                style: {
                  display: function(node) {
                    return nodeHelper.nodeFocused(self.currentFocus, node) && nodeVisible(node) ? 'inline' : 'none';
                  },
                  'fill-opacity': _.wrap(this.currentFocus, nodeHelper.textNodeOpacity.bind(nodeHelper))
                },
                text: nodeHelper.textNodeContent.bind(nodeHelper)
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
                  style: {
                    display: function(node) { return nodeVisible(node) ? 'block' : 'none'; }
                  }
                }
              }
            ]
          },
          {
            name: 'text-data',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'text',
                properties: {
                  style: {
                    display: function(node) {
                      return nodeHelper.nodeFocused(self.currentFocus, node) && nodeVisible(node) ? 'inline' : 'none';
                    },
                    'fill-opacity': function(node) {
                      return nodeHelper.textNodeOpacity(self.currentFocus, node);
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ];
};
