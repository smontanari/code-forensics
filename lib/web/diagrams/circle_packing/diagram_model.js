var _  = require('lodash'),
    ko = require('knockout');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(diameter, nodesArray, nodeHelper) {
  var self = this;
  this.rootNode = nodesArray[0];
  this.visibleSeries = ko.observable(nodesArray);
  this.currentFocus = ko.observable(this.rootNode);

  this.filterableSeries = _.map(_.filter(nodesArray, function(node) { return node.isLeaf(); }), nodeHelper.nodeValue);
  this.filterVisibleSeries = function(filters) {
    this.visibleSeries(_.filter(nodesArray, function(node){
      var nodeWeight = nodeHelper.nodeWeight(node);
      var isNodeAboveWeightThreshold = _.isUndefined(nodeWeight) || (_.isNumber(nodeWeight) && nodeWeight >= filters.weightFilter.outputValue());

      var isNodeAboveValueThreshold = _.isNumber(node.value) && node.value >= filters.valueFilter.outputValue();

      return node.isRoot() || (isNodeAboveWeightThreshold && isNodeAboveValueThreshold);
    }));
  };

  this.onUpdate = function(callback) {
    _.each([this.visibleSeries, this.currentFocus], function(observable) {
      observable.subscribe(_.wrap(self, callback));
    });
  };

  var nodeVisible = function(node) {
    return nodeHelper.nodeHiglighted(node) || _.includes(self.visibleSeries(), node);
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'circle-packing', width: diameter, height: diameter }
      },
      data: {
        series: nodesArray,
        graphicElements: [
          {
            type: 'circle',
            properties: {
              offset: nodeHelper.nodeOffset,
              attributes: {
                class: nodeHelper.circleNodeClass,
                r: nodeHelper.circleNodeRadius
              },
              style: {
                display: function(node) { return nodeVisible(node) ? 'block' : 'none'; },
                fill: nodeHelper.circleNodeFill,
                'fill-opacity': nodeHelper.circleNodeOpacity
              }
            },
            tooltip: {
              properties: {
                attributes: { class: 'd3-tip circle-packing-diagram' },
                html: function(node) {
                  return mustacheHelper.renderTemplate('circle-pack-tooltip-template', nodeHelper.nodeData(node));
                }
              },
              actions: {
                show: {
                  event: 'mouseover',
                  condition: function(node) {
                    return nodeHelper.nodeFocused(self.currentFocus(), node) && node.isLeaf();
                  }
                },
                hide: {
                  event: 'mouseout'
                }
              }
            }
          },
          {
            type: 'text',
            properties: {
              offset: nodeHelper.nodeOffset,
              attributes: { class: nodeHelper.textNodeClass },
              style: {
                display: function(node) {
                  return nodeHelper.nodeFocused(self.currentFocus(), node) && nodeVisible(node) ? 'inline' : 'none';
                },
                'fill-opacity': _.wrap(this.currentFocus(), nodeHelper.textNodeOpacity)
              },
              text: nodeHelper.textNodeContent
            }
          }
        ]
      },
      updateStrategy: {
        method: 'repaintData',
        arguments: [
          {
            type: 'circle',
            properties: {
              style: {
                display: function(node) { return nodeVisible(node) ? 'block' : 'none'; }
              }
            }
          },
          {
            type: 'text',
            properties: {
              style: {
                display: function(node) {
                  return nodeHelper.nodeFocused(self.currentFocus(), node) && nodeVisible(node) ? 'inline' : 'none';
                },
                'fill-opacity': function(node) {
                  return nodeHelper.textNodeOpacity(self.currentFocus(), node);
                }
              }
            }
          }
        ]
      }
    }
  ];
};
