/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3');

var Model   = require('../diagrams/bar_chart/vertical_bar_chart_model.js'),
    filters = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Sum of coupling analysis',
      description: 'modules most frequently coupled with others in single commits',
      diagramSelectionTitle: 'Metric',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs(
      [{ diagramName: 'sum-of-coupling' }]
    ).map(function(cfg) {
      return {
        id: cfg.diagramName,
        label: 'Sum of coupling',
        dataFile: manifest.dataFiles[0],
        controlTemplates: {
          filters: [{ name: 'textFilterTemplate', data: { labels: ['File path'] } }]
        },
        diagram: {
          Model: Model,
          configuration: {
            style: {
              cssClass: 'bar-chart-diagram',
              width: 1000,
              height: 650,
              margin: { top: 30, right: 10, bottom: 0, left: 10 },
              barWidth: 25,
              barColor: '#BFDDFB'
            },
            series: {
              x: { scale: d3.scaleLinear(), labelProperty: 'path', valueProperty: 'path' },
              y: { scale: d3.scaleLinear(), valueProperty: 'soc', labelProperty: '' }
            }
          },
          controls: {
            filters: {
              pathFilter: {
                instance: new filters.RegExpValue(),
                group: 'text'
              }
            }
          }
        }
      };
    })
  };
};
