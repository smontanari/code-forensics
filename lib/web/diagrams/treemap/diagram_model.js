var _  = require('lodash'),
    d3 = require('d3'),
    ko = require('knockout');

module.exports = function(config, nodesArray, nodeHelper) {
  var width = config.style.width - config.style.margin.left - config.style.margin.right,
      height = config.style.height - config.style.margin.top - config.style.margin.bottom;

  this.rootNode = nodesArray[0];
  this.visibleSeries = ko.observable(nodesArray);

  this.updateVisibleSeries = function() {};

  var nodeNames = _.sortBy(_.uniq(
    _.map(_.filter(nodesArray, function(node) { return !node.children; }), function(node) {
      return node.data.name;
    })
  ));

  var colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, nodeNames.length + 1]);
  nodeHelper.setRootNode(this.rootNode);

  this.createDataDefinition = function(targetNode) {
    return {
      properties: {
        attributes: { class: 'treemap-container' }
      },
      dataElements: [
        {
          key: 'parent-tiles',
          series: targetNode.children,
          properties: {
            attributes: { class: 'parent-tiles' }
          },
          graphicElements: [
            {
              type: 'rect',
              properties: {
                attributes: {
                  class: function(node) {
                    if (nodeHelper.hasLeafChildren(node)) { return 'parent-tile last'; }
                    else if (!node.children) { return 'leaf-tile'; }
                    return 'parent-tile';
                  },
                  x: nodeHelper.nodeHorizontalCoordinate,
                  y: nodeHelper.nodeVerticalCoordinate,
                  width: nodeHelper.nodeWidth,
                  height: nodeHelper.nodeHeight
                }
              },
              innerElements: [
                {
                  type: 'title',
                  properties: {
                    text: nodeHelper.nodeTitle
                  }
                }
              ]
            },
            {
              type: 'text',
              properties: {
                attributes: {
                  class: 'tile-title',
                  x: nodeHelper.nodeTextHorizontalCoordinate,
                  y: nodeHelper.nodeTextVerticalCoordinate,
                  dy: '.75em'
                }
              },
              innerElements: [
                {
                  type: 'tspan',
                  properties: {
                    attributes: {
                      class: function(node) { return node.children ? 'parent-tile' : 'child-tile'; },
                      x: nodeHelper.nodeTextHorizontalCoordinate
                    },
                    text: nodeHelper.nodeInnerText1
                  }
                },
                {
                  type: 'tspan',
                  properties: {
                    attributes: {
                      class: 'leaf-tile',
                      x: nodeHelper.nodeTextHorizontalCoordinate,
                      dy: '1.0em'
                    },
                    text: nodeHelper.nodeInnerText2
                  }
                }
              ]
            }
          ],
          subDataElements: [
            {
              key: 'children-tiles',
              series: function(node) { return node.children || [node]; },
              properties: {
                attributes: { class: 'children-tiles' }
              },
              graphicElements: [
                {
                  type: 'rect',
                  properties: {
                    attributes: {
                      x: nodeHelper.nodeHorizontalCoordinate,
                      y: nodeHelper.nodeVerticalCoordinate,
                      width: nodeHelper.nodeWidth,
                      height: nodeHelper.nodeHeight
                    },
                    style: {
                      fill: function(node) {
                        if (!node.children) {
                          return colorScale(_.indexOf(nodeNames, node.data.name));
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    };
  };

  this.chartDefinitions = [
    {
      name: 'header',
      properties: {
        attributes: { width: config.style.width, height: config.style.margin.top }
      },
      data: {
        dataElements: [
          {
            key: 'root-tile',
            series: [this.rootNode],
            properties: {
              attributes: { class: 'root-tile' }
            },
            graphicElements: [
              {
                type: 'rect',
                properties: {
                  attributes: {
                    width: width,
                    height: config.style.margin.top
                  }
                }
              },
              {
                type: 'text',
                properties: {
                  attributes: {
                    class: 'tile-title',
                    x: 5,
                    y: 5,
                    dy: '.75em'
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      name: 'main',
      properties: {
        attributes: { class: 'treemap', width: config.style.width, height: height }
      },
      data: this.createDataDefinition(this.rootNode)
    }
  ];
};
