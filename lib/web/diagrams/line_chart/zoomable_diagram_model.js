var _  = require('lodash');

var DiagramSupport         = require('./diagram_support.js'),
    LegendModel            = require('./legend_model.js'),
    ScatterPointsDataModel = require('./scatter_points_data_model.js'),
    ColorScaleFactory      = require('../../utils/color_scale_factory.js');

module.exports = function(config, series) {
  var diagramSupport = new DiagramSupport(config);
  var chartConfig = config.style;
  var axisConfig = config.axis;
  var brushConfig = config.brush;

  var actualWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  var actualHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
  var actualBrushHeight = brushConfig.height - brushConfig.margin.top - brushConfig.margin.bottom;

  var keys = _.compact(_.map(series, 'name'));
  var colorScale = ColorScaleFactory.default(keys);
  var legendDefinition, scatterPointsDataDefinitions, scatterPointsUpdateStrategyDefinitions;

  var diagramScale = diagramSupport.createScale(series, actualWidth, actualHeight);
  var brushScale = diagramSupport.createScale(series, actualWidth, actualBrushHeight);
  var chartPlotLine = diagramSupport.createPlotLine(diagramScale);
  var brushPlotLine = diagramSupport.createPlotLine(brushScale);

  if (keys.length > 1) {
    legendDefinition = new LegendModel(config, keys, colorScale).legendDefinition;
  }

  if (config.plotLine.scatterPoints) {
    var scatterPointsDataModel = new ScatterPointsDataModel(config, series, diagramScale, colorScale);
    scatterPointsDataDefinitions = scatterPointsDataModel.dataDefinitions;
    scatterPointsUpdateStrategyDefinitions = scatterPointsDataModel.updateStrategyDefinitions;
  }

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'line-chart', width: chartConfig.width, height: chartConfig.height }
      },
      innerElements: [
        {
          elementType: 'clipPath',
          properties: {
            attributes: { id: 'clip' }
          },
          innerElements: [
            {
              elementType: 'rect',
              properties: {
                attributes: {
                  width: actualWidth, height: actualHeight
                }
              }
            }
          ]
        }
      ],
      components: [
        {
          name: 'xAxis',
          componentType: 'axis',
          properties: {
            offset: { x: chartConfig.margin.left,  y: chartConfig.height - chartConfig.margin.bottom },
            attributes: { class: 'x axis' }
          },
          behavior: 'axisBottom',
          settings: {
            scale: diagramScale.x,
            tickFormat: axisConfig.x.tickFormat
          },
          innerElements: [
            {
              elementType: 'text',
              properties: {
                attributes: {
                  class: 'label',
                  x: chartConfig.width - chartConfig.margin.left - 10,
                  y: 20
                },
                text: axisConfig.x.label
              }
            }
          ]
        },
        {
          name: 'yAxis',
          componentType: 'axis',
          properties: {
            offset: { x: chartConfig.margin.left,  y: chartConfig.margin.top },
            attributes: { class: 'y axis' }
          },
          behavior: 'axisLeft',
          settings: {
            scale: diagramScale.y
          },
          innerElements: [
            {
              elementType: 'text',
              properties: {
                attributes: {
                  class: 'label',
                  y: 10 - chartConfig.margin.left,
                  dy: '.71em'
                },
                rotation: -90,
                text: axisConfig.y.label
              }
            }
          ]
        },
        {
          name: 'zoom',
          componentType: 'zoom',
          properties: {
            attributes: { class: 'zoom', width: actualWidth, height: actualHeight },
            offset: { x: chartConfig.margin.left,  y: chartConfig.margin.top }
          },
          elementType: 'rect',
          settings: {
            scaleExtent: [1, Infinity],
            translateExtent: [[0, 0], [actualWidth, actualHeight]],
            extent: [[0, 0], [actualWidth, actualHeight]],
            filter: function() { return !event.button && !event.mouseover && !event.mouseout; }
          }
        },
        {
          name: 'plot-line',
          componentType: 'data',
          properties: {
            offset: { x: chartConfig.margin.left,  y: chartConfig.margin.top },
            attributes: { class: 'series' }
          },
          series: series,
          graphicElements: [
            {
              elementType: 'path',
              properties: {
                attributes: { class: 'line', d: chartPlotLine, 'clip-path': 'url(#clip)' },
                style: { stroke: function(d) { return colorScale(d.name); } }
              }
            }
          ]
        }
      ].concat(
        [legendDefinition],
        scatterPointsDataDefinitions
      ),
      updateStrategy: {
        components: [
          {
            name: 'plot-line',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'path',
                properties: { attributes: { d: chartPlotLine } }
              }
            ]
          }
        ].concat(
          scatterPointsUpdateStrategyDefinitions
        )
      }
    },
    {
      name: 'brushPanel',
      properties: {
        attributes: { class: 'line-chart', width: chartConfig.width, height: 100 },
      },
      components: [
        {
          name: 'xAxis',
          componentType: 'axis',
          properties: {
            offset: { x: config.brush.margin.left,  y: brushConfig.height - brushConfig.margin.bottom },
            attributes: { class: 'x axis' }
          },
          behavior: 'axisBottom',
          settings: {
            scale: brushScale.x,
            tickFormat: axisConfig.x.tickFormat
          }
        },
        {
          name: 'brush',
          componentType: 'brush',
          properties: {
            attributes: { class: 'brush' },
            offset: { x: config.brush.margin.left,  y: config.brush.margin.top }
          },
          orientation: 'horizontal',
          settings: { extent: [[0, 0], [actualWidth, actualBrushHeight]] },
          activeSelection: [0, actualWidth]
        },
        {
          name: 'plot-line',
          componentType: 'data',
          properties: {
            offset: { x: config.brush.margin.left,  y: config.brush.margin.top },
            attributes: { class: 'series' }
          },
          series: series,
          graphicElements: [
            {
              elementType: 'path',
              properties: {
                attributes: { class: 'line', d: brushPlotLine, 'clip-path': 'url(#clip)' },
                style: { stroke: function(d) { return colorScale(d.name); } }
              }
            }
          ]
        }
      ]
    }
  ];
};
