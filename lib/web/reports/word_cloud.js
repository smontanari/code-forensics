var _ = require('lodash');

var Model            = require('../diagrams/word_cloud/diagram_model.js'),
    LayoutAdapter    = require('../diagrams/word_cloud/cloud_layout_adapter.js'),
    filters          = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Commit vocabulary',
      description: 'Word cloud of commit messages',
      diagramSelectionTitle: 'Time period',
      dateRange: manifest.parseDateRange()
    },
    graphModels: _.map(manifest.dataFiles, function(data) {
      var dates = data.timePeriod.split('_');
      return {
        id: 'cwc-' + data.timePeriod,
        label: 'from ' + dates[0] + ' to ' + dates[1],
        dataFile: data,
        controlTemplates: {
          filters: [{ name: 'metricRangeFilterTemplate' }]
        },
        diagram: {
          Model: Model,
          layoutAdapter: new LayoutAdapter({ width: 960, height: 700, wordPadding: 10 }),
          configuration: {
            style: {
              cssClass: 'cloud-diagram',
              width: 960,
              height: 700,
              minFontSize: 7
            }
          },
          filters: {
            wordOccurenciesFilter: {
              instance: new filters.MetricRange('Word occurency'),
              group: 'metricRange',
              dataTransform: function(series) { return _.map(series, 'count'); }
            }
          }
        }
      };
    })
  };
};
