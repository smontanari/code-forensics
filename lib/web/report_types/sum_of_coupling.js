var filters = require('../filters/index.js');

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
        graph: {
          dataFile: manifest.dataFiles[0].fileUrl,
          diagramType: 'BarChartDiagram',
          controlsTemplate: { id: 'barchart-control-template', file: 'barchart-control-template.html' }
        },
        diagram: {
          style: {
            margin: 10,
            width: 940,
            height: 680,
            barSize: 20,
            barGap:35,
            visibleBars: 25,
            colorRange: ['#ff9933', '#ff9933']
          },
          series: { valueProperty: 'soc', labelProperty: 'path' },
          filters: { dataFilter: new filters.RegExpValue('File path', 'path') }
        }
      }
    ]
  };
};
