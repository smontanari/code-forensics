var d3 = require('d3'),
    _  = require('lodash');

var DiagramModel = require('../diagrams/line_chart/diagram_model.js');

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
        id: 'cx-' + cfg.valueProperty,
        label: cfg.valueLabel,
        dataFile: manifest.dataFiles[0].fileUrl,
        diagram: {
          type: 'default',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'line-chart-diagram',
              width: 960,
              height: 600,
              margin: {top: 30, right: 70, bottom: 60, left: 70},
              tickFormat: { x: d3.timeFormat('%d %b %Y') }
            },
            series: {
              x: { axisLabel: 'Time', scale: d3.scaleTime(), valueProperty: 'date' },
              y: { axisLabel: cfg.yLabel, scale: d3.scaleLinear(), valueProperty: cfg.valueProperty },
            }
          },
          dataTransform: function(data) {
            var values = _.map(_.sortBy(data, 'date'), function(d) {
              var methodComplexityValues = _.map(d.methodComplexity, 'complexity');
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
      };
    })
  };
};
