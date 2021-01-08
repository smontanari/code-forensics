/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var Model            = require('../diagrams/enclosure_chart/weighted_diagram_model.js'),
    LayoutAdapter    = require('../diagrams/enclosure_chart/pack_layout_adapter.js'),
    ZoomHandler      = require('../diagrams/enclosure_chart/zoom_handler.js'),
    ClipboardHandler = require('../diagrams/enclosure_chart/clipboard_handler.js'),
    filters          = require('../filters/index.js');

var GRAPH_MODELS_CONFIG = [
  { diagramName: 'sloc', valueProperty: 'sourceLines', diagramLabel: 'Lines of code', valueLabel: 'Source lines of code' },
  { diagramName: 'complexity', valueProperty: 'totalComplexity', diagramLabel: 'Cyclomatic Complexity', valueLabel: 'Complexity' }
];

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Hotspot analysis',
      description: 'metric vs churn analysis',
      diagramSelectionTitle: 'Metric selection',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs(GRAPH_MODELS_CONFIG)
      .map(function(cfg) {
        return {
          id: 'hotspot-analysis-' + cfg.diagramName,
          label: cfg.diagramLabel,
          dataFile: manifest.dataFiles[0],
          controlTemplates: {
            filters: [
              { name: 'metricRangeFilterTemplate', data: { labels: [cfg.valueLabel] } },
              { name: 'percentageRangeFilterTemplate', data: { labels: ['Revision churn level %'] } }
            ]
          },
          viewTemplates: ['elementInfoTooltipTemplate'],
          diagram: {
            Model: Model,
            layoutAdapter: new LayoutAdapter({ diameter: 1000, valueProperty: cfg.valueProperty }),
            graphHandlers: [
              new ZoomHandler({ diameter: 1000 }),
              new ClipboardHandler({ text: _.method('fullName'), message: 'Filename copied to clipboard' })
            ],
            configuration: {
              style: {
                cssClass: 'circle-packing-diagram',
                diameter: 1000,
                nodeDepthColorRange: ['hsl(185,60%,99%)', 'hsl(187,40%,70%)'],
                weightedNodeColor: '#990012'
              },
              series: _.extend({}, cfg, { calculatedWeightProperty: 'weight' }),
              tooltipInfo: {
                templateId: 'element-info-tooltip',
                templateProperties: [
                  { label: cfg.valueLabel, valueProperty: cfg.valueProperty },
                  { label: 'Revisions', valueProperty: 'revisions' }
                ]
              }
            },
            controls: {
              filters: {
                valueFilter: {
                  instance: new filters.MetricRange(),
                  group: 'metricRange',
                  dataTransform: function(series) {
                    return _.map(_.filter(series, _.method('isLeaf')), 'value');
                  }
                },
                weightFilter: {
                  instance: new filters.PercentageMetricRange(),
                  group: 'percentageRange'
                }
              }
            }
          }
        };
      })
  };
};
