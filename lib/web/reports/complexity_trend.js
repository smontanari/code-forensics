/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var DiagramModel      = require('../diagrams/line_chart/zoomable_diagram_model.js'),
    ZoomBrushHandler  = require('../diagrams/line_chart/zoom_brush_handler.js'),
    ClipboardHandler  = require('../diagrams/line_chart/clipboard_handler.js'),
    SeriesGroup       = require('../models/series_group_model.js'),
    ColorScaleFactory = require('../utils/color_scale_factory.js'),
    localeDetection   = require('../utils/locale_detection.js');

var GRAPH_MODELS_CONFIG = [
  { diagramName: 'total', valueProperty: 'complexity', valueLabel: 'Module total', yLabel: 'Complexity' },
  { diagramName: 'func-mean', valueProperty: 'mean', valueLabel: 'Function Mean', yLabel: 'Complexity' },
  { diagramName: 'func-sd', valueProperty: 'deviation', valueLabel: 'Function SD', yLabel: 'Complexity' }
];

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Complexity trend analysis',
      description: 'file: ' + manifest.parameters.targetFile,
      diagramSelectionTitle: 'Trend metric',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs(GRAPH_MODELS_CONFIG)
      .map(function(cfg) {
        return {
          id: 'lc-' + cfg.diagramName,
          label: cfg.valueLabel,
          dataFile: manifest.dataFiles[0],
          viewTemplates: ['elementInfoTooltipTemplate'],
          diagram: {
            Model: DiagramModel,
            graphHandlers: [
              new ZoomBrushHandler({ zoomWidth: 820 }),
              new ClipboardHandler({
                seriesName: 'Complexity Trend',
                text: _.property('revision'),
                message: 'Revision copied to clipboard'
              })
            ],
            configuration: {
              plotName: 'cx-' + cfg.diagramName,
              style: {
                cssClass: 'line-chart-diagram',
                width: 960,
                height: 480,
                margin: { top: 30, right: 70, bottom: 30, left: 70 }
              },
              colorScaleFactory: function(series) {
                var seriesNames = _.compact(_.map(series, 'name'));
                return ColorScaleFactory.defaultOrdinal(seriesNames);
              },
              brush: {
                height: 100,
                margin: { top: 10, right: 70, bottom: 30, left: 70 }
              },
              axis: {
                x: { label: 'Time', tickFormat: d3.timeFormat('%d %b') },
                y: { label: cfg.yLabel }
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
                templateId: 'element-info-tooltip',
                templateProperties: [
                  { label: 'Revision', valueProperty: 'revision' },
                  { label: 'Date', valueProperty: 'date', transform: function(date) { return date.toLocaleString(localeDetection(), { hour12: false }); } },
                  { label: 'Value', valueProperty: cfg.valueProperty }
                ]
              }
            },
            dataTransform: function(data) {
              var dataSeries = new SeriesGroup([{ group: 'file', name: 'Complexity Trend' }], { sortBy: 'date' });
              _.each(data, function(d) {
                var methodComplexityValues = _.map(d.methodComplexity, 'complexity');
                dataSeries.addValue({
                  revision: d.revision,
                  date: new Date(d.date),
                  mean: d3.mean(methodComplexityValues),
                  deviation: d3.deviation(methodComplexityValues) || 0,
                  complexity: d.totalComplexity
                });
              });
              return [dataSeries];
            }
          }
        };
    })
  };
};
