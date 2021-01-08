/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

var DiagramSupport = require('./diagram_support.js'),
    LegendModel    = require('./legend_model.js');

module.exports = function(configuration, series) {
  var diagramSupport = new DiagramSupport(configuration);
  var chartConfig = configuration.style;
  var axisConfig = configuration.axis;

  var actualWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right,
      actualHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  var seriesGroups = _.groupBy(_.flatMap(series, 'groupDefinitions'), 'group');
  var colorScale = configuration.colorScaleFactory(series);

  var diagramScale = diagramSupport.createScale(series, actualWidth, actualHeight);
  var plotLine = diagramSupport.createPlotLine(diagramScale);

  var visibleGroups = _.mapValues(seriesGroups, function(groups) {
    return ko.observable(_.uniq(_.map(groups, 'name')));
  });

  var seriesVisible = function(s) {
    return _.every(visibleGroups, function(groupNames, group) {
      return s.hasAnyKey(group, groupNames());
    });
  };

  var legendDefinition;
  if (series.length > 1) {
    legendDefinition = new LegendModel(configuration, series, colorScale).legendDefinition;
  }

  this.applyFilters = function(filters, changedFilter) {
    visibleGroups[changedFilter.instance.groupKey](changedFilter.instance.outputValue());
  };

  this.onModelChange = function(listener) {
    _.forOwn(visibleGroups, function(groupNamesObservable) {
      groupNamesObservable.subscribe(listener);
    });
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: {
          viewBox: '0 0 ' + chartConfig.width + ' ' + chartConfig.height
        }
      },
      components: [
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
                rotation: -90,
                attributes: {
                  class: 'label',
                  y: 10 - chartConfig.margin.left,
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
            offset: { x: chartConfig.margin.left,  y: chartConfig.height - chartConfig.margin.bottom },
            attributes: { class: 'x axis' }
          },
          behavior: 'axisBottom',
          settings: { scale: diagramScale.x, tickSizeOuter: 0 },
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
                  x: actualWidth + chartConfig.margin.right,
                  y: 20
                },
                text: axisConfig.x.label
              }
            }
          ]
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
                attributes: { class: 'line', d: plotLine },
                style: { stroke: colorScale }
              }
            }
          ]
        },
        legendDefinition
      ],
      updateStrategy: {
        components: [
          {
            name: 'plot-line',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'path',
                properties: {
                  style: {
                    display: function(d) { return seriesVisible(d) ? 'block' : 'none'; }
                  }
                }
              }
            ]
          },
          {
            name: 'legend',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'circle',
                properties: {
                  style: {
                    'fill-opacity': function(d) { return seriesVisible(d) ? 1 : 0.1; }
                  }
                }
              },
              {
                elementSelection: 'text',
                properties: {
                  style: {
                    'fill-opacity': function(d) { return seriesVisible(d) ? 1 : 0.1; }
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ];
};
