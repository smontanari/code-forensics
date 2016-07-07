require('d3');
var _ = require('lodash');

module.exports = function(parameters) {
  var modulePath = parameters.modulePath.getValue();
  var seriesTransformer = function(data) {
    var values = _.map(_.sortBy(data, "date"), function(d) {
      var methodComplexityValues = _.map(d.methodComplexity, function(m) {return m.complexity;});
      return {
        date: new Date(d.date),
        mean: d3.mean(methodComplexityValues),
        deviation: d3.deviation(methodComplexityValues) || 0,
        complexity: d.totalComplexity
      };
    });
    return [{ values: values }];
  };
  return {
    metadata: {
      title: 'Complexity trend analysis',
      description: modulePath,
      diagramSelectionTitle: 'Stat selection'
    },
    graphs: _.map([
      { valueProperty: 'complexity', valueLabel: 'Module total', yLabel: 'Total Complexity' },
      { valueProperty: 'mean', valueLabel: 'Method Mean', yLabel: 'Mean Complexity' },
      { valueProperty: 'deviation', valueLabel: 'Method SD', yLabel: 'SD Complexity' },
    ], function(cfg) {
      return {
        id: "cx-" + cfg.valueProperty,
        label: cfg.valueLabel,
        dataFile: modulePath.split('/').join('_') + '_complexity-trend-data.json',
        diagramType: "LineChartDiagram",
        style: {
          width: 960, height: 600, margin: {top: 30, right: 70, bottom: 30, left: 70},
          tickFormat: { x: d3.time.format('%b %d') },
          colorScale: d3.scale.category10()
        },
        series: {
          x: { axisLabel: 'Time', scale: d3.time.scale(), valueProperty: 'date' },
          y: { axisLabel: cfg.yLabel, scale: d3.scale.linear(), valueProperty: cfg.valueProperty },
        },
        transformData: seriesTransformer
      };
    })
  };
};
