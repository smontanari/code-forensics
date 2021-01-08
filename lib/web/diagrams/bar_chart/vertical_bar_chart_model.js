/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash'),
    ko = require('knockout');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, series) {
  var barPadding = configuration.style.barWidth * 0.2;
  var actualWidth = configuration.style.width - configuration.style.margin.left - configuration.style.margin.right;
  var actualHeight = d3.max([series.length * (configuration.style.barWidth + barPadding), configuration.style.height]) - configuration.style.margin.top - configuration.style.margin.bottom;

  var visibleSeries = ko.observable(series);

  this.applyFilters = function(filters) {
    var regexpFilter = filters.pathFilter.instance.outputValue();
    visibleSeries(_.filter(series, function(obj) {
      var objValue = obj[configuration.series.x.valueProperty];

      if (_.isRegExp(regexpFilter)) { return regexpFilter.test(objValue); }
      return objValue.includes(regexpFilter);
    }));
  };

  this.onModelChange = function(listener) {
    visibleSeries.subscribe(listener);
  };

  var visibleBars = (configuration.style.height - configuration.style.margin.top - configuration.style.margin.bottom)/(configuration.style.barWidth + barPadding);

  var xScale = configuration.series.x.scale
   .domain([0, visibleBars])
   .range([0, configuration.style.height]);

  var yScale = configuration.series.y.scale
    .domain([0, d3.max(series, _.property(configuration.series.y.valueProperty))])
    .range([0, actualWidth]);

  var tooltipDefinition;

  if (configuration.tooltipInfo) {
    tooltipDefinition = {
      class: 'bar-chart-diagram left-arrow',
      html: function(_event, d) {
        return mustacheHelper.renderTemplate.call(null, configuration.tooltipInfo.templateId, {
          data: _.map(configuration.tooltipInfo.templateProperties, function(prop) {
            return { label: prop.label, value: d[prop.valueProperty] };
          })
        });
      },
      direction: 'e',
      offset: [0, 10]
    };
  }

  this.chartDefinitions = [
    {
      name: 'yAxis',
      properties: {
        attributes: {
          viewBox: '0 0 ' + configuration.style.width + ' ' + configuration.style.margin.top
        }
      },
      components: [
        {
          name: 'yAxis',
          componentType: 'axis',
          properties: {
            offset: { x: configuration.style.margin.left, y: configuration.style.margin.top - 1 },
            attributes: { class: 'y axis' }
          },
          behavior: 'axisTop',
          settings: { scale: yScale }
        }
      ]
    },
    {
      name: 'main',
      htmlWrapper: {
        elementType: 'div',
        properties: {
          attributes: { class: 'vertical-wrapper' },
          style: { height: configuration.style.height + 'px' }
        }
      },
      properties: {
        attributes: { class: 'bar-chart',
          viewBox: '0 0 ' + configuration.style.width + ' ' + actualHeight
        }
      },
      components: [
        {
          name: 'bars-plot',
          componentType: 'data',
          properties: {
            offset: { x: configuration.style.margin.left },
            attributes: { class: 'bars' }
          },
          series: _.ary(visibleSeries, 0),
          graphicElements: [
            {
              elementType: 'rect',
              properties: {
                style: { fill: configuration.style.barColor },
                attributes: {
                  width: function(d) { return yScale(d[configuration.series.y.valueProperty]); },
                  height: configuration.style.barWidth,
                  x: 0,
                  y: function(d, i) { return xScale(i) + barPadding; }
                }
              },
              tooltip: tooltipDefinition
            },
            {
              elementType: 'text',
              properties: {
                text: function(d) { return d[configuration.series.x.labelProperty]; },
                attributes: {
                  x: 5,
                  y: function(d, i) { return xScale(i) + configuration.style.barWidth - barPadding/2; }
                }
              }
            }
          ]
        }
      ],
      updateStrategy: {
        components: [
          {
            name: 'bars-plot',
            method: 'reset'
          }
        ]
      }
    }
  ];
};
