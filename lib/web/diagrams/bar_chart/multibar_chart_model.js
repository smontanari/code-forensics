/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var ScaleDomainFactory = require('../../utils/scale_domain_factory.js');

module.exports = function(configuration, series) {
  var styleConfig = configuration.style;
  var seriesConfig = configuration.series;
  var axisConfig = configuration.axis;

  var xValue = function(d) { return d[seriesConfig.x.valueProperty]; };
  var barNameValue = function(d) { return d[seriesConfig.x.bandValueProperty]; };
  var yValue = function(d) { return d[seriesConfig.y.valueProperty]; };
  var colorScale = configuration.colorScaleFactory(series);

  var bandNames = _.reduce(series, function(a, d) { return _.union(a, _.map(d.values, function(v) { return barNameValue(v); })); }, []);
  var actualWidth = styleConfig.width - styleConfig.margin.left - styleConfig.margin.right,
      actualHeight = styleConfig.height - styleConfig.margin.top - styleConfig.margin.bottom;

  var dataArrayX = series.map(xValue);
  var dataArrayY = _.flatMap(series, function(s) { return _.map(s.values, yValue); });

  var xScale = seriesConfig.x.scale
    .domain(ScaleDomainFactory(dataArrayX, 'extentBased'))
    .range([0, actualWidth]);

  var xScaleBand = d3.scaleBand()
    .domain(series.map(xValue))
    .range([0, actualWidth])
    .padding(0.2);

  var barNameScale = d3.scaleBand()
    .domain(bandNames)
    .range([0, xScaleBand.bandwidth()]);

  var yScale = seriesConfig.y.scale
    .domain(ScaleDomainFactory(dataArrayY, 'zeroBased'))
    .range([actualHeight, 0]);

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: {
          class: 'bar-chart',
          viewBox: '0 0 ' + styleConfig.width + ' ' + styleConfig.height
        }
      },
      components: [
        {
          name: 'yAxis',
          componentType: 'axis',
          properties: {
            offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top },
            attributes: { class: 'y axis' }
          },
          behavior: 'axisLeft',
          settings: { scale: yScale },
          innerElements: [
            {
              elementType: 'text',
              properties: {
                rotation: -90,
                attributes: {
                  class: 'label',
                  y: 10 - styleConfig.margin.left,
                  dy: '.71em'
                },
                text: axisConfig.y.label
              }
            }
          ]
        },
        {
          name: 'xAxis',
          componentType: 'axis',
          properties: {
            offset: { x: styleConfig.margin.left, y: styleConfig.height - styleConfig.margin.bottom },
            attributes: { class: 'x axis' }
          },
          behavior: 'axisBottom',
          settings: { scale: xScale, tickSizeOuter: 0 },
          labels: {
            properties: {
              rotation: 45,
              attributes: { 'text-anchor': 'start' }
            }
          },
          innerElements: [
            {
              elementType: 'text',
              properties: {
                attributes: {
                  class: 'label',
                  x: actualWidth + styleConfig.margin.right,
                  y: 20
                },
                text: axisConfig.x.label
              }
            }
          ]
        },
        {
          name: 'bars-plot',
          componentType: 'data',
          properties: {
            offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top }
          },
          series: series,
          subDataElements: [
            {
              properties: {
                offset: function(d) { return { x: xScaleBand(xValue(d)) }; },
                attributes: { class: 'series' }
              },
              series: function(d) { return d.values; },
              graphicElements: [
                {
                  elementType: 'rect',
                  properties: {
                    attributes: {
                      width: barNameScale.bandwidth(),
                      height: function(d) { return actualHeight - yScale(yValue(d)); },
                      x: function(d) { return barNameScale(barNameValue(d)); },
                      y: function(d) { return yScale(yValue(d)); }
                    },
                    style: { fill: function(d) { return colorScale(barNameValue(d)); } }
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'legend-data',
          componentType: 'data',
          properties: {
            attributes: { class: 'legend' },
            offset: { x: styleConfig.width - styleConfig.margin.right,  y: styleConfig.margin.top }
          },
          series: bandNames,
          graphicElements: [
            {
              elementType: 'rect',
              properties: {
                offset: function(d, i) { return { x: 10, y: i * 15 }; },
                attributes: {
                  width: 10,
                  height: 10,
                  x: 25,
                  y: 4
                },
                style: { fill: colorScale }
              }
            },
            {
              elementType: 'text',
              properties: {
                offset: function(d, i) { return { x: 10, y: i * 15 }; },
                attributes: {
                  x: 20,
                  y: 9,
                  dy: '.35em'
                },
                text: _.identity
              }
            }
          ]
        }
      ]
    }
  ];
};
