/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var DiagramSupport         = require('./diagram_support.js'),
    LegendModel            = require('./legend_model.js'),
    ScatterPointsDataModel = require('./scatter_points_data_model.js');

module.exports = function(configuration, series) {
  var diagramSupport = new DiagramSupport(configuration);
  var chartConfig = configuration.style;
  var axisConfig = configuration.axis;
  var brushConfig = configuration.brush;

  var actualWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  var actualHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
  var actualBrushHeight = brushConfig.height - brushConfig.margin.top - brushConfig.margin.bottom;

  var colorScale = configuration.colorScaleFactory(series);
  var legendDefinition, scatterPointsDataDefinitions, scatterPointsUpdateStrategyDefinitions;

  var diagramScale = diagramSupport.createScale(series, actualWidth, actualHeight);
  var brushScale = diagramSupport.createScale(series, actualWidth, actualBrushHeight);
  var chartPlotLine = diagramSupport.createPlotLine(diagramScale);
  var brushPlotLine = diagramSupport.createPlotLine(brushScale);

  if (series.length > 1) {
    legendDefinition = new LegendModel(configuration, series, colorScale).legendDefinition;
  }

  if (configuration.plotLine.scatterPoints) {
    var scatterPointsDataModel = new ScatterPointsDataModel(configuration, series, diagramScale, colorScale);
    scatterPointsDataDefinitions = scatterPointsDataModel.dataDefinitions;
    scatterPointsUpdateStrategyDefinitions = scatterPointsDataModel.updateStrategyDefinitions;
  }

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: {
          class: 'line-chart',
          viewBox: '0 0 ' + configuration.style.width + ' ' + configuration.style.height
        }
      },
      innerElements: [
        {
          elementType: 'clipPath',
          properties: {
            attributes: { id: 'clip-' + configuration.plotName }
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
          settings: { scale: diagramScale.x },
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
          settings: { scale: diagramScale.y },
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
            filter: function(event) { return !event.button && !event.mouseover && !event.mouseout; }
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
                attributes: { class: 'line', d: chartPlotLine, 'clip-path': 'url(#clip-' + configuration.plotName + ')' },
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
        attributes: {
          class: 'line-chart',
          viewBox: '0 0 ' + configuration.style.width + ' ' + 100
        }
      },
      components: [
        {
          name: 'xAxis',
          componentType: 'axis',
          properties: {
            offset: { x: configuration.brush.margin.left,  y: brushConfig.height - brushConfig.margin.bottom },
            attributes: { class: 'x axis' }
          },
          behavior: 'axisBottom',
          settings: { scale: brushScale.x }
        },
        {
          name: 'brush',
          componentType: 'brush',
          properties: {
            attributes: { class: 'brush' },
            offset: { x: configuration.brush.margin.left,  y: configuration.brush.margin.top }
          },
          orientation: 'horizontal',
          settings: { extent: [[0, 0], [actualWidth, actualBrushHeight]] },
          activeSelection: [0, actualWidth]
        },
        {
          name: 'plot-line',
          componentType: 'data',
          properties: {
            offset: { x: configuration.brush.margin.left,  y: configuration.brush.margin.top },
            attributes: { class: 'series' }
          },
          series: series,
          graphicElements: [
            {
              elementType: 'path',
              properties: {
                attributes: { class: 'line', d: brushPlotLine, 'clip-path': 'url(#clip-' + configuration.plotName + ')' },
                style: { stroke: function(d) { return colorScale(d.name); } }
              }
            }
          ]
        }
      ]
    }
  ];
};
