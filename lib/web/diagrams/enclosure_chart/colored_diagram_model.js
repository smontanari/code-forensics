/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

var NodeHelper     = require('./colored_node_helper.js'),
    mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, nodesArray) {
  var self = this;
  var nodeHelper = new NodeHelper(configuration);
  this.rootNode = nodesArray[0];
  this.currentFocus = this.rootNode;

  var visibleSeries = ko.observable(nodesArray);
  var highlightedValue = ko.observable(null);
  var allLeafNodes = _.filter(nodesArray, _.method('isLeaf'));
  var allColorValues = _.uniqBy(_.map(allLeafNodes, nodeHelper.nodeColorValue.bind(nodeHelper)));
  var colorScale = configuration.colorScaleFactory(allColorValues);

  this.applyFilters = function(filters, changedFilter) {
    if (changedFilter === filters.valueFilter) {
      visibleSeries(_.filter(nodesArray, function(node){
        var isNodeAboveValueThreshold = _.isNumber(node.value) && node.value >= filters.valueFilter.instance.outputValue();

        return node.isRoot() || isNodeAboveValueThreshold;
      }));
    }
    if (changedFilter === filters.colorFilter) {
      highlightedValue(filters.colorFilter.instance.outputValue());
    }
  };

  this.onModelChange = function(listener) {
    highlightedValue.subscribe(listener);
    visibleSeries.subscribe(listener);
  };

  var nodeVisible = function(node) {
    return _.includes(visibleSeries(), node);
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
                  fill: function(node) {
                    if (node.isLeaf()) {
                      return colorScale(nodeHelper.nodeColorValue(node));
                    }
                    return nodeHelper.circleNodeFill(node);
                  },
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
                    display: function(node) { return nodeVisible(node) ? 'block' : 'none'; },
                    'fill-opacity': function(node) {
                      if (node.isLeaf()) {
                        if (highlightedValue() !== null && highlightedValue() !== nodeHelper.nodeColorValue(node)) {
                          return 0.05;
                        }
                      }
                    }
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
