/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout');

var NodeHelper = require('./node_helper.js');

module.exports = function(configuration, nodesArray) {
  var nodeHelper = new NodeHelper(configuration);
  var width = configuration.style.width - configuration.style.margin.left - configuration.style.margin.right,
      height = configuration.style.height - configuration.style.margin.top - configuration.style.margin.bottom;

  var colorScale = configuration.colorScaleFactory(nodesArray);
  this.rootNode = nodesArray[0];
  this.activeNode = ko.observable(this.rootNode);
  this.activeNode.subscribe(nodeHelper.setNodeScale);

  nodeHelper.setNodeScale(this.rootNode);

  this.createTreemapDefinition = function(targetNode) {
    return {
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
                      return colorScale(node.data.name);
                    }
                  }
                }
              }
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
        attributes: {
          viewBox: '0 0 ' + configuration.style.width + ' ' + configuration.style.margin.top
        }
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
                  height: configuration.style.margin.top
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
      ],
      updateStrategy: {
        components: [
          {
            name: 'root-tile',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'text',
                properties: {
                  text: nodeHelper.nodeParentName
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
        attributes: {
          viewBox: '0 0 ' + configuration.style.width + ' ' + height
        }
      },
      components: [this.createTreemapDefinition(this.rootNode)],
      updateStrategy: {
        components: [
          {
            name: 'treemap-container',
            method: 'repaint',
            parameters: [
              {
                elementSelection: '.tile-title',
                properties: {
                  attributes: {
                    x: nodeHelper.nodeTextHorizontalCoordinate,
                    y: nodeHelper.nodeTextVerticalCoordinate
                  }
                }
              },
              {
                elementSelection: '.tile-title tspan',
                properties: {
                  attributes: {
                    x: nodeHelper.nodeTextHorizontalCoordinate
                  }
                }
              },
              {
                elementSelection: '.tile-title tspan.parent-tile',
                properties: {
                  text: nodeHelper.nodeInnerText1
                }
              },
              {
                elementSelection: '.tile-title tspan.child-tile',
                properties: {
                  text: nodeHelper.nodeInnerText1
                }
              },
              {
                elementSelection: '.tile-title tspan.leaf-tile',
                properties: {
                  text: nodeHelper.nodeInnerText2
                }
              },
              {
                elementSelection: 'rect',
                properties: {
                  attributes: {
                    x: nodeHelper.nodeHorizontalCoordinate,
                    y: nodeHelper.nodeVerticalCoordinate,
                    width: nodeHelper.nodeWidth,
                    height: nodeHelper.nodeHeight
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
