/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var Model             = require('../diagrams/enclosure_chart/colored_diagram_model.js'),
    LayoutAdapter     = require('../diagrams/enclosure_chart/pack_layout_adapter.js'),
    ZoomHandler       = require('../diagrams/enclosure_chart/zoom_handler.js'),
    ColorScaleFactory = require('../utils/color_scale_factory.js'),
    filters           = require('../filters/index.js');

var GRAPH_MODELS_CONFIG = [
  { diagramName: 'individual-knowledge-map', label: 'Developers', colorProperty: 'mainDev' },
  { diagramName: 'team-knowledge-map', label: 'Teams', colorProperty: 'team' }
];

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Knowledge Map analysis',
      description: 'Knowledge distribution between developers/teams',
      diagramSelectionTitle: 'View',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs(GRAPH_MODELS_CONFIG)
      .map(function(cfg) {
        return {
          id: cfg.diagramName,
          label: cfg.label,
          dataFile: manifest.dataFiles[0],
          controlTemplates: {
            filters: [
              { name: 'metricRangeFilterTemplate', data: { labels: ['Total lines of code'] } },
              { name: 'colorMapFilterTemplate', data: { labels: [cfg.label] } }
            ]
          },
          viewTemplates: ['elementInfoTooltipTemplate'],
          diagram: {
            Model: Model,
            layoutAdapter: new LayoutAdapter({ diameter: 1000, valueProperty: 'totalLines' }),
            graphHandlers: [new ZoomHandler({ diameter: 1000 })],
            configuration: {
              style: {
                cssClass: 'circle-packing-diagram',
                diameter: 1000,
                nodeDepthColorRange: ['hsl(0,0%,100%)', 'hsl(0,0%,80%)']
              },
              colorScaleFactory: function(series) {
                return ColorScaleFactory.sequentialRainbow(series);
              },
              series: { valueProperty: 'totalLines', colorProperty: cfg.colorProperty },
              tooltipInfo: {
                templateId: 'element-info-tooltip',
                templateProperties: [
                  { label: 'Developer', valueProperty: 'mainDev' },
                  { label: 'Team', valueProperty: 'team' },
                  { label: 'Ownership', valueProperty: 'ownership' },
                  { label: 'Added lines', valueProperty: 'addedLines' }
                ]
              }
            },
            controls: {
              filters: {
                valueFilter: {
                  instance: new filters.MetricRange(),
                  group: 'metricRange',
                  dataTransform: function(series) {
                    return _.map(_.filter(series, _.method('isLeaf')), 'data.totalLines');
                  }
                },
                colorFilter: {
                  instance: new filters.ColorRange(ColorScaleFactory.sequentialRainbow),
                  group: 'colorRange',
                  dataTransform: function(series) {
                    return _.uniqBy(
                      _.map(_.filter(series, _.method('isLeaf')), 'data.' + cfg.colorProperty)
                    );
                  }
                }
              }
            },
            dataTransform: function(series) {
              var validData = _.some(series, function(node) {
                return node.isLeaf() && _.isString(node.data[cfg.colorProperty]);
              });
              if (validData) {
                return _.filter(series, function(node) {
                  return !node.isLeaf() || _.isString(node.data[cfg.colorProperty]);
                });
              }
            }
          }
        };
      })
  };
};
