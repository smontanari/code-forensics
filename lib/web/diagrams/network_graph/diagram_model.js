/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, data) {
  var colorScale = configuration.colorScaleFactory(data);
  var currentSelection;
  var selectedNodes = [];

  var findLinkedNodes = function(node) {
    return _.reduce(data.links, function(list, link) {
      if (node === link.source) { list.push(link.target); }
      if (node === link.target) { list.push(link.source); }
      return list;
    }, []);
  };

  this.graphData = data;

  this.selectNode = function(targetNode) {
    if (currentSelection === targetNode) {
      selectedNodes = [];
      currentSelection = undefined;
    } else {
      selectedNodes = findLinkedNodes(targetNode);
      currentSelection = targetNode;
    }
  };

  var nodeHidden = function(node) {
    return currentSelection && currentSelection !==  node && !_.includes(selectedNodes, node);
  };

  var linkHighlighted = function(link) {
    return currentSelection === link.source || currentSelection === link.target;
  };

  var linkHidden = function(link) {
    return currentSelection && currentSelection !== link.source && currentSelection !== link.target;
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: {
          viewBox: '0 0 ' + configuration.style.width + ' ' + configuration.style.height
        }
      },
      components: [
        {
          name: 'link-data',
          componentType: 'data',
          series: data.links,
          properties: {
            attributes: { class: 'links' }
          },
          graphicElements: [
            {
              elementType: 'line',
              properties: {
                attributes: {
                  'stroke-width': function(link) { return Math.max(1, link.couplingStrength / 5); }
                }
              },
              tooltip: {
                class: 'network-graph-diagram link-info',
                html: function(_event, link) {
                  return mustacheHelper.renderTemplate.apply(null, [
                    configuration.linkTooltipInfo.templateId,
                    {
                      name: link.source.name + ' - ' + link.target.name,
                      data: _.map(configuration.linkTooltipInfo.templateProperties, function(prop) {
                        return { label: prop.label, value: link[prop.valueProperty] || 'n/a' };
                      })
                    }
                  ]);
                },
                allowDisable: configuration.tooltip.disableOnDeactivation
              }
            }
          ]
        },
        {
          name: 'node-data',
          componentType: 'data',
          series: data.nodes,
          properties: {
            attributes: { class: 'nodes' }
          },
          graphicElements: [
            {
              elementType: 'circle',
              properties: {
                attributes: {
                  'r': configuration.style.nodeRadius,
                  fill: function(node) { return colorScale(node.team); }
                }
              },
              tooltip: {
                class: 'network-graph-diagram node-info',
                html: function(_event, node) {
                  return mustacheHelper.renderTemplate.apply(null, [
                    configuration.nodeTooltipInfo.templateId,
                    {
                      data: _.map(configuration.nodeTooltipInfo.templateProperties, function(prop) {
                        return {
                          cssClass: prop.cssClass,
                          cssStyle: prop.cssStyle,
                          value: node[prop.valueProperty]
                        };
                      })
                    }
                  ]);
                },
                allowDisable: configuration.tooltip.disableOnDeactivation
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
                  attributes: {
                    class: function(node) {
                      if (nodeHidden(node)) { return 'node-hidden'; }
                    }
                  }
                }
              }
            ]
          },
          {
            name: 'link-data',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'line',
                properties: {
                  attributes: {
                    class: function(link) {
                      if (linkHighlighted(link)) { return 'highlighted'; }
                      if (linkHidden(link)) { return 'link-hidden'; }
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
