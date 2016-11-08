var _  = require('lodash');

var DiagramModel = require('../diagrams/word_cloud/diagram_model.js'),
    filters      = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Commit vocabulary',
      description: 'Word cloud of commit messages',
      dateRange: manifest.parseDateRange()
    },
    graphModels: _.map(manifest.dataFiles, function(data) {
      var dates = data.timePeriod.split('_');
      return {
        id: 'cwc-' + data.timePeriod,
        label: 'from ' + dates[0] + ' to ' + dates[1],
        dataFile: data.fileUrl,
        templates: [
          { id: 'range-filters', type: 'ko', file: 'range_filters_control_template.html', layout: 'graphControls' }
        ],
        diagram: {
          type: 'word_cloud',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'cloud-diagram',
              width: 960,
              height: 700,
              wordPadding: 10,
              minFontSize: 7
            },
            filters: {
              wordOccurenciesFilter: new filters.RoundedMetricRange('Word occurency')
            }
          }
        }
      };
    })
  };
};
