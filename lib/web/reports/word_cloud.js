/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash');

var Model             = require('../diagrams/word_cloud/diagram_model.js'),
    LayoutAdapter     = require('../diagrams/word_cloud/cloud_layout_adapter.js'),
    ColorScaleFactory = require('../utils/color_scale_factory.js'),
    filters           = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Commit vocabulary',
      description: 'Word cloud of commit messages',
      diagramSelectionTitle: 'Time period',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs(
      _.map(manifest.dataFiles, function(data) {
        var dates = data.timePeriod.split('_');
        return {
          id: 'cwc-' + data.timePeriod,
          diagramName: 'commit-words',
          label: 'from ' + dates[0] + ' to ' + dates[1],
          dataFile: data,
          controlTemplates: {
            filters: [{ name: 'metricRangeFilterTemplate', data: { labels: ['Word occurency'] } }]
          },
          diagram: {
            Model: Model,
            layoutAdapter: new LayoutAdapter({ width: 1000, height: 650, wordPadding: 10 }),
            configuration: {
              style: {
                cssClass: 'cloud-diagram',
                width: 1000,
                height: 650,
                minFontSize: 7
              },
              colorScaleFactory: ColorScaleFactory.defaultOrdinal
            },
            controls: {
              filters: {
                wordOccurenciesFilter: {
                  instance: new filters.MetricRange(),
                  group: 'metricRange',
                  dataTransform: function(series) { return _.map(series, 'count'); }
                }
              }
            }
          }
        };
      })
    )
  };
};
