var d3 = require('d3');

var filters      = require('../filters/index.js'),
    DiagramModel = require('../diagrams/bar_chart/vertical_bar_chart_model.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Sum of coupling analysis',
      description: 'modules most frequently coupled with others in single commits',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'soc',
        dataFile: manifest.dataFiles[0].fileUrl,
        templates: [
          { name: 'controls-template', type: 'ko', id: 'sum-of-coupling-control-template', file: 'sum-of-coupling-control-template.html' },
        ],
        diagram: {
          type: 'default',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'bar-chart-diagram',
              width: 960,
              height: 680,
              margin: { top: 10, right: 10, bottom: 10, left: 10 },
              barSize: 20,
              visibleBars: 25,
              barColor: '#BFDDFB'
            },
            series: {
              x: { scale: d3.scaleLinear(), labelProperty: 'path', valueProperty: 'path' },
              y: { scale: d3.scaleLinear(), valueProperty: 'soc', labelProperty: '' }
            },
            filters: { pathFilter: new filters.RegExpValue('File path') }
          }
        }
      }
    ]
  };
};
