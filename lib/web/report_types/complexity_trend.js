require('d3');
var _ = require('lodash');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Complexity trend analysis',
      description: 'file: ' + manifest.targetFile,
      diagramSelectionTitle: 'Stat selection',
      dateRange: manifest.parseDateRange()
    },
    graphModels: _.map([
      { valueProperty: 'complexity', valueLabel: 'Module total', yLabel: 'Total Complexity' },
      { valueProperty: 'mean', valueLabel: 'Method Mean', yLabel: 'Mean Complexity' },
      { valueProperty: 'deviation', valueLabel: 'Method SD', yLabel: 'SD Complexity' },
    ], function(cfg) {
      return {
        id: "cx-" + cfg.valueProperty,
        graph: {
          label: cfg.valueLabel,
          dataFile: manifest.getFilePath(),
          diagramType: "LineChartDiagram",
          dataEvents: {
            onLoad: function(data) {
              var values = _.map(_.sortBy(data, 'date'), function(d) {
                var methodComplexityValues = _.map(d.methodComplexity, function(m) {return m.complexity;});
                return {
                  date: new Date(d.date),
                  mean: d3.mean(methodComplexityValues),
                  deviation: d3.deviation(methodComplexityValues) || 0,
                  complexity: d.totalComplexity
                };
              });
              return [{ values: values }];
            }
          }
        },
        diagram: {
          style: {
            width: 960, height: 600, margin: {top: 30, right: 70, bottom: 30, left: 70},
            tickFormat: { x: d3.time.format('%b %d') },
            colorScale: d3.scale.category10()
          },
          series: {
            x: { axisLabel: 'Time', scale: d3.time.scale(), valueProperty: 'date' },
            y: { axisLabel: cfg.yLabel, scale: d3.scale.linear(), valueProperty: cfg.valueProperty },
          },
        }
      };
    })
  };
};
