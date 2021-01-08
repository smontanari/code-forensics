/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var BubbleChartModel       = require('../diagrams/bubble_chart/diagram_model.js'),
    PackLayoutAdapter      = require('../diagrams/bubble_chart/pack_layout_adapter.js'),
    SelectHandler          = require('../diagrams/bubble_chart/circle_select_handler.js'),
    ColorScaleFactory      = require('../utils/color_scale_factory.js'),
    ForceSimulationHandler = require('../diagrams/network_graph/force_simulation_handler.js'),
    NetworkGraphModel      = require('../diagrams/network_graph/diagram_model.js'),
    widgets                = require('../widgets/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Author coupling analysis',
      description: 'code ownership and communication coupling between programmers',
      diagramSelectionTitle: 'View',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs([
      {
        diagramName: 'main-developer-coupling',
        id: 'main-developer-coupling',
        label: 'Code ownership',
        dataFile: _.find(manifest.dataFiles, { fileType: 'code-ownership' }),
        viewTemplates: ['elementInfoTooltipTemplate'],
        diagram: {
          Model: BubbleChartModel,
          layoutAdapter: new PackLayoutAdapter({ diameter: 1000, nameProperty: 'path', valueProperty: 'authors' }),
          graphHandlers: [new SelectHandler()],
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram',
              diameter: 1000,
              weightedNodeColor: '#990012',
              selectedNodeColor: '#00AB1A'
            },
            colorScaleFactory: function() {
              return ColorScaleFactory.gradientLinear([0, manifest.parameters.maxCoupledFiles], ['#1269FC', '#CADDFC']);
            },
            series: {
              nameProperty: 'path', valueProperty: 'authors', valueLabel: 'Authors', calculatedWeightProperty: 'weight',
              linkedNodesProperty: 'coupledEntries', linkProperty: 'path', linkDegreeProperty: 'couplingDegree'
            },
            tooltip: { disableOnDeactivation: true },
            tooltipInfo: {
              templateId: 'element-info-tooltip',
              templateModel: [
                { label: 'Authors', valueProperty: 'authors' },
                { label: 'Revisions', valueProperty: 'revisions' },
                { label: 'Main dev', valueProperty: 'mainDev' },
                { label: 'Ownership', valueProperty: 'ownership' }
              ]
            },
            selectedTooltipInfo: {
              templateId: 'element-info-tooltip',
              templateModel: {
                linkedNodeProperties: [
                  { label: 'Main dev', valueProperty: 'mainDev' },
                  { label: 'Ownership', valueProperty: 'ownership' }
                ],
                selectedNodeProperties: [
                  { label: 'Coupling degree', valueProperty: 'couplingDegree' },
                  { label: 'Revisions (avg)', valueProperty: 'revisionsAvg' }
                ]
              }
            }
          }
        }
      },
      {
        diagramName: 'communication-network',
        id: 'communication-network',
        label: 'Communication network',
        dataFile: _.find(manifest.dataFiles, { fileType: 'communication-network' }),
        controlTemplates: {
          widgets: [{ name: 'colorMapWidgetTemplate', data: { labels: ['Teams'] } }]
        },
        viewTemplates: ['itemListTooltipTemplate', 'elementInfoTooltipTemplate'],
        diagram: {
          Model: NetworkGraphModel,
          graphHandlers: [
            new ForceSimulationHandler({
              nodeIdProperty: 'name',
              linkStrengthFactorProperty: 'sharedCommits',
              width: 1000,
              height: 1000,
              nodeRadius: 10
            }),
            new SelectHandler()
          ],
          configuration: {
            style: {
              cssClass: 'network-graph-diagram',
              width: 1000,
              height: 1000,
              nodeRadius: 10
            },
            colorScaleFactory: function(series) {
              var values = _.compact(_.uniqBy(_.map(series.nodes, 'team')));
              if (_.isEmpty(values)) { return ColorScaleFactory.defaultOrdinal(); }
              return ColorScaleFactory.sequentialRainbow(values);
            },
            tooltip: { disableOnDeactivation: true },
            nodeTooltipInfo: {
              templateId: 'item-list-tooltip',
              templateProperties: [
                { valueProperty: 'name', cssClass: 'title' },
                { valueProperty: 'team' }
              ]
            },
            linkTooltipInfo: {
              templateId: 'element-info-tooltip',
              templateProperties: [
                { label: 'Shared commits', valueProperty: 'sharedCommits' },
                { label: 'Coupling strength', valueProperty: 'couplingStrength' }
              ]
            }
          },
          controls: {
            widgets: {
              colorMap: {
                instance: new widgets.ColorMap(),
                group: 'colorMap',
                dataTransform: function(series) {
                  return _.compact(_.uniqBy(_.map(series.nodes, 'team')));
                }
              }
            }
          },
          dataTransform: function(data) {
            return {
              nodes: _.uniqBy(_.concat(
                _.map(data, 'developer'), _.map(data, 'coupledDeveloper')),
              'name'),
              links: _.map(data, function(entry) {
                return {
                  source: entry.developer.name,
                  target: entry.coupledDeveloper.name,
                  sharedCommits: entry.sharedCommits,
                  couplingStrength: entry.couplingStrength
                };
              })
            };
          }
        }
      }
    ])
  };
};
