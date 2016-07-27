require('d3');
var _ = require('lodash');

var filters = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Hotspot analysis',
      description: 'metric vs churn analysis',
      diagramSelectionTitle: 'Metric selection',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      { valueProperty: 'sloc', valueLabel: 'Lines Of Code' },
      { valueProperty: 'totalComplexity', valueLabel: 'Complexity' }
    ].map(function(cfg) {
      return {
        id: 'hs-' + cfg.valueProperty,
        graph: {
          label: cfg.valueLabel,
          dataFile: manifest.getFilePath(),
          controlsTemplate: { id: 'hotspot-control-template', file: 'hotspot-control-template.html' },
          diagramType: 'CirclePackingDiagram'
        },
        diagram:{
          style: {
            diameter: 950,
            colorScale: d3.scale.linear().domain([-1, 5]).range(['hsl(185,60%,99%)', 'hsl(187,40%,70%)']).interpolate(d3.interpolateHcl),
            colorValues: { weightColor: '#990012', noColor: '#F5F5F5' }
          },
          series: _.extend({}, cfg, { weightProperty: 'revisions', weightLabel: 'Revisions', calculatedWeightProperty: 'weight' }),
          filters: {
            valueFilter: new filters.RoundedMetricRange(cfg.valueLabel),
            weightFilter: new filters.PercentageMetricRange('Churn level %')
          }
        }
      };
    })
  };
};
