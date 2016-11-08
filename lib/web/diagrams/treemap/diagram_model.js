var _  = require('lodash'),
    d3 = require('d3'),
    ko = require('knockout');

var ColorValueMap = function(values, interpolator) {
  var colorScale = d3.scaleSequential(interpolator).domain([0, values.length + 1]);

  this.colorFor = function(value) {
    return colorScale(_.indexOf(values, value));
  };
};

module.exports = function(config, nodesArray, nodeHelper) {
  var width = config.style.width - config.style.margin.left - config.style.margin.right,
      height = config.style.height - config.style.margin.top - config.style.margin.bottom;

  var nodeNames = _.sortBy(_.uniq(
    _.map(_.filter(nodesArray, function(node) { return !node.children; }), function(node) {
      return node.data.name;
    })
  ));

  var colorValueMap = new ColorValueMap(nodeNames, d3.interpolateRainbow);

  this.rootNode = nodesArray[0];
  this.visibleSeries = ko.observable(nodesArray);
  this.updateVisibleSeries = function() {};

  this.colorMap = _.map(nodeNames, function(nodeName) {
    return { name: nodeName, color: colorValueMap.colorFor(nodeName) };
  });

  nodeHelper.setRootNode(this.rootNode);

  this.createDataDefinition = function(targetNode) {
    return [
      {
        name: 'treemap-container',
        componentType: 'data',
        series: targetNode.children,
        properties: {
          attributes: { class: 'treemap-container' }
        },
        graphicElements: [
          {
            elementType: 'rect',
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
                elementType: 'title',
                properties: {
                  text: nodeHelper.nodeTitle
                }
              }
            ]
          },
          {
            elementType: 'text',
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
                elementType: 'tspan',
                properties: {
                  attributes: {
                    class: function(node) { return node.children ? 'parent-tile' : 'child-tile'; },
                    x: nodeHelper.nodeTextHorizontalCoordinate
                  },
                  text: nodeHelper.nodeInnerText1
                }
              },
              {
                elementType: 'tspan',
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
            name: 'children-tiles',
            series: function(node) { return node.children || [node]; },
            properties: {
              attributes: { class: 'children-tiles' }
            },
            graphicElements: [
              {
                elementType: 'rect',
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
                        return colorValueMap.colorFor(node.data.name);
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    ];
  };

  this.chartDefinitions = [
    {
      name: 'header',
      properties: {
        attributes: { width: config.style.width, height: config.style.margin.top }
      },
      components: [
        {
          name: 'root-tile',
          componentType: 'data',
          series: [this.rootNode],
          properties: {
            attributes: { class: 'root-tile' }
          },
          graphicElements: [
            {
              elementType: 'rect',
              properties: {
                attributes: {
                  width: width,
                  height: config.style.margin.top
                }
              }
            },
            {
              elementType: 'text',
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
    },
    {
      name: 'main',
      properties: {
        attributes: { class: 'treemap', width: config.style.width, height: height }
      },
      components: this.createDataDefinition(this.rootNode)
    }
  ];
};
