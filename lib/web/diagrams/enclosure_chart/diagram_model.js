var _  = require('lodash'),
    ko = require('knockout');

var NodeHelper     = require('./node_helper.js');
var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, nodesArray) {
  var self = this;
  var nodeHelper = new NodeHelper(configuration);
  this.rootNode = nodesArray[0];
  this.visibleSeries = ko.observable(nodesArray);
  this.currentFocus = this.rootNode;

  this.seriesValues = _.map(_.filter(nodesArray, _.method('isLeaf')), 'value');

  this.updateVisibleSeries = function(filters) {
    this.visibleSeries(_.filter(nodesArray, function(node){
      var nodeWeight = nodeHelper.nodeWeight(node);
      var isNodeAboveWeightThreshold = _.isUndefined(nodeWeight) || (_.isNumber(nodeWeight) && nodeWeight >= filters.weightFilter.outputValue());

      var isNodeAboveValueThreshold = _.isNumber(node.value) && node.value >= filters.valueFilter.outputValue();

      return node.isRoot() || (isNodeAboveWeightThreshold && isNodeAboveValueThreshold);
    }));
  };

  this.nodeVisible = function(node) {
    return nodeHelper.nodeHiglighted(node) || _.includes(self.visibleSeries(), node);
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'circle-pack', width: configuration.style.diameter, height: configuration.style.diameter }
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
                  class: nodeHelper.circleNodeClass,
                  r: nodeHelper.circleNodeRadius
                },
                style: {
                  display: function(node) { return self.nodeVisible(node) ? 'block' : 'none'; },
                  fill: nodeHelper.circleNodeFill,
                  'fill-opacity': nodeHelper.circleNodeOpacity
                }
              },
              tooltip: {
                properties: {
                  attributes: { class: 'd3-tip circle-packing-diagram' },
                  html: function(node) {
                    return mustacheHelper.renderTemplate.apply(null, nodeHelper.nodeTooltipTemplateArgs(node));
                  }
                },
                actions: {
                  show: {
                    event: 'mouseover',
                    condition: function(node) {
                      return nodeHelper.nodeFocused(self.currentFocus, node) && node.isLeaf();
                    }
                  },
                  hide: {
                    event: 'mouseout'
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
          graphicElements: [
            {
              elementType: 'text',
              properties: {
                offset: nodeHelper.nodeOffset,
                attributes: { class: nodeHelper.textNodeClass },
                style: {
                  display: function(node) {
                    return nodeHelper.nodeFocused(self.currentFocus, node) && self.nodeVisible(node) ? 'inline' : 'none';
                  },
                  'fill-opacity': _.wrap(this.currentFocus, nodeHelper.textNodeOpacity)
                },
                text: nodeHelper.textNodeContent
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
                    display: function(node) { return self.nodeVisible(node) ? 'block' : 'none'; }
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
                      return nodeHelper.nodeFocused(self.currentFocus, node) && self.nodeVisible(node) ? 'inline' : 'none';
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
