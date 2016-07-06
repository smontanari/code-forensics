var filters = require('../filters/index.js');

module.exports = function(parameters) {
  return {
    metadata: {
      title: 'Sum of coupling',
      description: 'modules most frequently coupled with others in single commits'
    },
    graphs: [
      {
        id: 'soc',
        dataFile: 'sum-coupling-analysis.json',
        diagramType: 'BarChartDiagram',
        controlsTemplate: { id: 'barchart-control-template', file: 'barchart-control-template.html' },
        valueProperty: 'soc',
        labelProperty: 'path',
        visibleBars: 25,
        style: {
          margin: 10,
          width: 940,
          height: 680,
          barSize: 20,
          barGap:35,
          colorRange: ['#CCFFFF', '#3366CC']
        },
        filters: { dataFilter: new filters.RegExpValue('File path', 'path') }
      }
    ]
  };
};
