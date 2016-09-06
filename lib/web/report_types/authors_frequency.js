var d3 = require('d3');

var DiagramModel = require('../diagrams/bar_chart/vertical_bar_chart_model.js'),
    filters      = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Code authoring analysis',
      description: 'modules shared by the most programmers',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'auth',
        dataFile: manifest.dataFiles[0].fileUrl,
        templates: [
          { name: 'controls-template', type: 'ko', id: 'text-filters-control-template', file: 'text-filters-control-template.html' },
          { name: 'tooltip-template', type: 'mustache', id: 'simple-tooltip-template', file: 'simple-tooltip-template.html' }
        ],
        diagram: {
          type: 'default',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'bar-chart-diagram',
              width: 960,
              height: 680,
              margin: { top: 30, right: 10, bottom: 0, left: 10 },
              barWidth: 25,
              barColor: '#85E085'
            },
            series: {
              x: { scale: d3.scaleLinear(), valueProperty: 'path', labelProperty: 'path' },
              y: { scale: d3.scaleLinear(), valueProperty: 'authors', labelProperty: 'Number of authors' },
            },
            tooltipInfo: {
              templateId: 'simple-tooltip-template',
              templateProperties: [
                { label: 'Authors', valueProperty: 'authors' },
                { label: 'Revisions', valueProperty: 'revisions' }
              ]
            },
            filters: { pathFilter: new filters.RegExpValue('File path') }
          }
        }
      }
    ]
  };
};
