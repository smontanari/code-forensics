var d3 = require('d3'),
    _  = require('lodash');

var DiagramSupport         = require('./diagram_support.js'),
    LegendModel            = require('./legend_model.js'),
    ScatterPointsDataModel = require('./scatter_points_data_model.js');

module.exports = function(config, series) {
  var diagramSupport = new DiagramSupport(config);
  var chartConfig = config.style;
  var axisConfig = config.axis;
  var brushConfig = config.brush;

  var actualWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  var actualHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
  var actualBrushHeight = brushConfig.height - brushConfig.margin.top - brushConfig.margin.bottom;

  var keys = _.compact(_.map(series, 'name'));
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);
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
          type: 'clipPath',
          properties: {
            attributes: { id: 'clip' }
          },
          innerElements: [
            {
              type: 'rect',
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
          name: 'axes',
          componentType: 'axis',
          properties: { offset: { x: chartConfig.margin.left,  y: chartConfig.margin.top } },
          axisElements: [
            {
              name: 'X',
              properties: {
                attributes: { class: 'x axis' },
                offset: { y: actualHeight }
              },
              value: 'axisBottom',
              settings: {
                scale: diagramScale.x,
                tickFormat: axisConfig.x.tickFormat
              },
              innerElements: [
                {
                  type: 'text',
                  properties: {
                    attributes: {
                      class: 'label',
                      x: actualWidth + chartConfig.margin.right - 10,
                      y: 20
                    },
                    text: axisConfig.x.label
                  }
                }
              ]
            },
            {
              name: 'Y',
              properties: {
                attributes: { class: 'y axis' }
              },
              value: 'axisLeft',
              settings: {
                scale: diagramScale.y
              },
              innerElements: [
                {
                  type: 'text',
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
          type: 'rect',
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
              type: 'path',
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
            method: 'repaintData',
            arguments: [
              {
                type: 'path',
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
          name: 'axes',
          componentType: 'axis',
          properties: { offset: { x: config.brush.margin.left,  y: config.brush.margin.top } },
          axisElements: [
            {
              name: 'X',
              properties: {
                attributes: { class: 'x axis' },
                offset: { y: actualBrushHeight }
              },
              value: 'axisBottom',
              settings: {
                scale: brushScale.x,
                tickFormat: axisConfig.x.tickFormat
              }
            }
          ]
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
              type: 'path',
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
