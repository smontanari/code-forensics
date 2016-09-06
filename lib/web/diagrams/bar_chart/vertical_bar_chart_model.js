var d3 = require('d3'),
    _  = require('lodash'),
    ko = require('knockout');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(config, series) {
  var barPadding = config.style.barWidth * 0.2;
  var actualWidth = config.style.width - config.style.margin.left - config.style.margin.right;
  var actualHeight = d3.max([series.length * (config.style.barWidth + barPadding), config.style.height]) - config.style.margin.top - config.style.margin.bottom;

  this.visibleSeries = ko.observable(series);

  this.updateVisibleSeries = function(filters) {
    var regexpFilter = filters.pathFilter.outputValue();
    this.visibleSeries(_.filter(series, function(obj) {
      var objValue = obj[config.series.x.valueProperty];

      if (_.isRegExp(regexpFilter)) { return regexpFilter.test(objValue); }
      return objValue.includes(regexpFilter);
    }));
  };

  var visibleBars = (config.style.height - config.style.margin.top - config.style.margin.bottom)/(config.style.barWidth + barPadding);

  var xScale = config.series.x.scale
   .domain([0, visibleBars])
   .range([0, config.style.height]);

  var yScale = config.series.y.scale
    .domain([0, d3.max(series, _.property(config.series.y.valueProperty))])
    .range([0, actualWidth]);

  var tooltipDefinition;

  if (config.tooltipInfo) {
    tooltipDefinition = {
      properties: {
        attributes: { class: 'd3-tip bar-chart-diagram left-arrow' },
        html: function(d) {
          return mustacheHelper.renderTemplate.call(null, config.tooltipInfo.templateId, {
            data: _.map(config.tooltipInfo.templateProperties, function(prop) {
              return { label: prop.label, value: d[prop.valueProperty] };
            })
          });
        }
      },
      direction: 'e',
      offset: [0, 10],
      actions: { show: { event: 'mouseover' }, hide: { event: 'mouseout' } }
    };
  }

  this.chartDefinitions = [
    {
      name: 'yAxis',
      properties: {
        attributes: { class: 'fixed opaque', width: config.style.width - config.style.margin.right, height: config.style.margin.top },
      },
      axis: {
        properties: { offset: { x: config.style.margin.left, y: config.style.margin.top - 1 } },
        axisElements: [
          {
            properties: {
              attributes: { class: 'y axis' },
            },
            value: 'axisTop',
            settings: { scale: yScale }
          }
        ]
      }
    },
    {
      name: 'main',
      properties: {
        attributes: { class: 'bar-chart', width: config.style.width, height: actualHeight },
      },
      data: {
        properties: {
          offset: { x: config.style.margin.left, y: config.style.margin.top },
          attributes: { class: 'bars' }
        },
        series: _.ary(this.visibleSeries, 0),
        graphicElements: [
          {
            type: 'rect',
            properties: {
              style: { fill: config.style.barColor },
              attributes: {
                width: function(d) { return yScale(d[config.series.y.valueProperty]); },
                height: config.style.barWidth,
                x: 0,
                y: function(d, i) { return xScale(i) + barPadding; }
              }
            },
            tooltip: tooltipDefinition
          },
          {
            type: 'text',
            properties: {
              text: function(d) { return d[config.series.x.labelProperty]; },
              attributes: {
                x: 5,
                y: function(d, i) { return xScale(i) + config.style.barWidth - barPadding/2; }
              }
            }
          }
        ]
      },
      updateStrategy: { method: 'resetData' }
    }
  ];
};
