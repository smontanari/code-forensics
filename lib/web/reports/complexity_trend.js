var d3 = require('d3'),
    _  = require('lodash');

var DiagramModel    = require('../diagrams/line_chart/zoomable_diagram_model.js'),
    localeDetection = require('../utils/locale_detection.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Complexity trend analysis',
      description: 'file: ' + manifest.parameters.targetFile,
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
        templates: [
          { id: 'data-point-tooltip', type: 'mustache', file: 'data_point_tooltip_template.html' }
        ],
        diagram: {
          type: 'line_chart',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'line-chart-diagram',
              width: 960,
              height: 600,
              margin: {top: 30, right: 70, bottom: 30, left: 70}
            },
            brush: {
              height: 100,
              margin: { top: 10, right: 70, bottom: 30, left: 70 }
            },
            axis: {
              x: { label: 'Time', tickFormat: d3.timeFormat('%d %b') },
              y: { label: 'Complexity' }
            },
            plotLine: {
              curve: d3.curveLinear,
              scatterPoints: {
                valueProperty: { x: 'date', y: cfg.valueProperty }
              }
            },
            series: {
              x: {
                scale: d3.scaleTime,
                valueProperty: 'date',
                domainFactory: function(dataArray) {
                  var extent = d3.extent(dataArray);
                  return d3.scaleTime()
                    .domain(extent)
                    .nice(d3.timeWeek)
                    .domain();
                }
              },
              y: {
                scale: d3.scaleLinear,
                valueProperty: cfg.valueProperty,
                domainFactory: function(dataArray) {
                  var extent = d3.extent(dataArray);
                  var padding = (extent[1] - extent[0])/10;
                  return [extent[0] - padding, extent[1] + padding];
                }
              }
            },
            tooltipInfo: {
              templateId: 'data-point-tooltip',
              templateProperties: [
                { label: 'Revision', valueProperty: 'revision' },
                { label: 'Date', valueProperty: 'date', transform: function(date) { return date.toLocaleString(localeDetection(), { hour12: false }); } },
                { label: 'Value', valueProperty: cfg.valueProperty }
              ]
            }
          },
          dataTransform: function(data) {
            var values = _.map(_.sortBy(data, 'date'), function(d) {
              var methodComplexityValues = _.map(d.methodComplexity, 'complexity');
              return {
                revision: d.revision,
                date: new Date(d.date),
                mean: d3.mean(methodComplexityValues),
                deviation: d3.deviation(methodComplexityValues) || 0,
                complexity: d.totalComplexity
              };
            });
            return [{ name: 'Complexity Trend', values: values }];
          }
        }
      };
    })
  };
};
