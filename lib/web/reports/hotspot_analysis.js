var _  = require('lodash');

var DiagramModel = require('../diagrams/enclosure_chart/diagram_model.js'),
    filters      = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Hotspot analysis',
      description: 'metric vs churn analysis',
      diagramSelectionTitle: 'Metric selection',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      { valueProperty: 'sloc', valueLabel: 'Lines of code' },
      { valueProperty: 'totalComplexity', valueLabel: 'Complexity' }
    ].map(function(cfg) {
      return {
        id: 'hs-' + cfg.valueProperty,
        label: cfg.valueLabel,
        dataFile: manifest.dataFiles[0].fileUrl,
        templates: [
          { id: 'range-filters', type: 'ko', file: 'range_filters_control_template.html', layout: 'graphControls' },
          { id: 'circle-pack-tooltip', type: 'mustache', file: 'circle_pack_tooltip_template.html' }
        ],
        diagram:{
          type: 'enclosure_chart',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram hotspot-analysis',
              width: 960,
              height: 960,
              diameter: 950,
              nodeDepthColorRange: ['hsl(185,60%,99%)', 'hsl(187,40%,70%)'],
              weightedNodeColor: '#990012'
            },
            series: _.extend({}, cfg, { calculatedWeightProperty: 'weight' }),
            tooltipInfo: {
              templateId: 'circle-pack-tooltip',
              templateProperties: [
                { label: cfg.valueLabel, valueProperty: cfg.valueProperty },
                { label: 'Revisions', valueProperty: 'revisions' }
              ]
            },
            filters: {
              valueFilter: new filters.MetricRange(cfg.valueLabel),
              weightFilter: new filters.PercentageMetricRange('Churn level %')
            }
          }
        }
      };
    })
  };
};
