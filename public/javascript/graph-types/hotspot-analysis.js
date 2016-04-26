var CodeForensics = (function(module) {
  var graphConfiguration = function(parameters) {
    return {
      metadata: {
        title: 'Hotspot Analysis Graph',
        description: 'Metric analysis vs churn',
        diagramSelectionTitle: 'Metric selection',
      },
      graphs: _.map([
        { valueProperty: 'sloc', label: 'Lines Of Code', valueFilterLabel: 'Lines of code' },
        { valueProperty: 'totalComplexity', label: 'Complexity', valueFilterLabel: 'Complexity' }
      ], function(cfg) {
        return {
          id: 'hs-' + cfg.valueProperty, label: cfg.label,
          url: 'data/revisions-hotspot-data.json',
          controlsTemplateId: 'hotspot-control-template',
          diagram: {
            type: 'CirclePackingDiagram',
            series: _.extend(cfg, { weightProperty: 'revisions', calculatedWeightProperty: 'weight' }),
            style: {
              diameter: 960, margin: 10,
              colorRange: { from: 'hsl(185,60%,99%)', to: 'hsl(187,40%,70%)' },
              colorValues: { weightColor: '#990012', noColor: '#F5F5F5' }
            },
            filters: [
              { name: 'valueFilter', label: cfg.valueFilterLabel, type: 'RoundedMetricRange'},
              { name: 'weightFilter', label: 'Churn level %', type: 'PercentageMetricRange'}
            ]
          }
        };
      })
    };
  };

  module.GraphTypeFactory = _.extend(module.GraphTypeFactory || {}, {
    "hostspot-analysis": graphConfiguration
  });
  return module;
})(CodeForensics || {});
