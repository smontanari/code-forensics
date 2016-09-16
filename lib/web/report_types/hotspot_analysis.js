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
          { name: 'controls-template', type: 'ko', id: 'range-filters-control-template', file: 'range-filters-control-template.html' },
          { name: 'tooltip-template', type: 'mustache', id: 'circle-pack-tooltip-template', file: 'circle-pack-tooltip-template.html' }
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
              templateId: 'circle-pack-tooltip-template',
              templateProperties: [
                { label: cfg.valueLabel, valueProperty: cfg.valueProperty },
                { label: 'Revisions', valueProperty: 'revisions' }
              ]
            },
            filters: {
              valueFilter: new filters.RoundedMetricRange(cfg.valueLabel),
              weightFilter: new filters.PercentageMetricRange('Churn level %')
            }
          }
        }
      };
    })
  };
};
