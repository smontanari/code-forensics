require('d3');
var _ = require('lodash');

var filters = require('../filters/index.js');

module.exports = function(parameters) {
  return {
    metadata: {
      title: 'Hotspot Analysis Graph',
      description: 'metric vs churn analysis',
      diagramSelectionTitle: 'Metric selection',
    },
    graphs: [
      { valueProperty: 'sloc', valueLabel: 'Lines Of Code' },
      { valueProperty: 'totalComplexity', valueLabel: 'Complexity' }
    ].map(function(cfg) {
      return {
        id: 'hs-' + cfg.valueProperty,
        label: cfg.valueLabel,
        dataFile: 'revisions-hotspot-data.json',
        controlsTemplate: { id: 'hotspot-control-template', file: 'hotspot-control-template.html' },
        diagramType: 'CirclePackingDiagram',
        series: _.extend(cfg, { weightProperty: 'revisions', weightLabel: 'Revisions', calculatedWeightProperty: 'weight' }),
        style: {
          diameter: 950,
          colorScale: d3.scale.linear().domain([-1, 5]).range(['hsl(185,60%,99%)', 'hsl(187,40%,70%)']).interpolate(d3.interpolateHcl),
          colorValues: { weightColor: '#990012', noColor: '#F5F5F5' }
        },
        filters: {
          valueFilter: new filters.RoundedMetricRange(cfg.valueLabel),
          weightFilter: new filters.PercentageMetricRange('Churn level %')
        }
      };
    })
  };
};
