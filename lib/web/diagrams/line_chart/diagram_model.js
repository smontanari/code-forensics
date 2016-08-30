var d3 = require('d3'),
    _  = require('lodash');

module.exports = function(config, series) {
  var styleConfig = config.style;
  var seriesConfig = config.series;

  var actualWidth = styleConfig.width - styleConfig.margin.left - styleConfig.margin.right,
      actualHeight = styleConfig.height - styleConfig.margin.top - styleConfig.margin.bottom;

  var scale = {
    x: seriesConfig.x.scale.range([0, actualWidth]),
    y: seriesConfig.y.scale.range([actualHeight, 0])
  };

  var reduceAxisData = function(series, axis) {
    return _.reduce(series, function(values, s) {
      var allValues = values.concat(_.map(s.values, seriesConfig[axis].valueProperty));
      return _.uniqBy(allValues, seriesConfig[axis].valueCompareFn || _.identity);
    }, []);
  };

  var dataArrayX = reduceAxisData(series, 'x');
  var dataArrayY = reduceAxisData(series, 'y');
  scale.x.domain(d3.extent(dataArrayX));
  scale.y.domain([0, d3.max(dataArrayY)]);

  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  var keys = _.compact(_.map(series, function(d) { return d.name; }));
  var legend;

  if (!_.isEmpty(keys)) {
    colorScale.domain(keys);
    var elementsOffset = function(d, i) { return { x: 30, y: i * 15 }; };
    legend = {
      properties: {
        offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top },
        attributes: { class: 'legend' }
      },
      series: keys,
      graphicElements: [
        {
          type: 'circle',
          properties: {
            offset: elementsOffset,
            attributes: {
              r: 5,
              cx: actualWidth + 30,
              cy: 9
            },
            style: { fill: colorScale }
          }
        },
        {
          type: 'text',
          properties: {
            offset: elementsOffset,
            attributes: {
              x: actualWidth + 20,
              y: 9,
              dy: '.35em',
            },
            text: _.identity
          }
        }
      ]
    };
  }

  var dataPoints = function(series) {
    var line = d3.line().curve(d3.curveBasis)
      .x(function(dataPoint) { return scale.x(dataPoint[seriesConfig.x.valueProperty]); })
      .y(function(dataPoint) { return scale.y(dataPoint[seriesConfig.y.valueProperty]); });

    return line(series.values);
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'line-chart', width: styleConfig.width, height: styleConfig.height },
      },
      axis: {
        properties: { offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top } },
        axisElements: [
          {
            properties: {
              attributes: { class: 'x axis' },
              offset: { y: actualHeight }
            },
            value: 'axisBottom',
            settings: {
              scale: scale.x,
              tickFormat: styleConfig.tickFormat.x
            },
            labels: {
              rotation: 45,
              style: { 'text-anchor': 'start' }
            },
            title: {
              text: seriesConfig.x.axisLabel,
              attributes: {
                class: 'label',
                x: actualWidth + 50,
                y: 10
              }
            }
          },
          {
            properties: {
              attributes: { class: 'y axis' }
            },
            value: 'axisLeft',
            settings: {
              scale: scale.y
            },
            title: {
              text: seriesConfig.y.axisLabel,
              rotation: -90,
              attributes: {
                class: 'label',
                y: -50,
                dy: '.71em'
              }
            }
          }
        ]
      },
      legend: legend,
      data: {
        properties: {
          offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top },
          attributes: { class: 'series' }
        },
        series: series,
        graphicElements: [
          {
            type: 'path',
            properties: {
              attributes: { class: 'line', d: dataPoints },
              style: { stroke: function(d) { return colorScale(d.name); } }
            }
          }
        ]
      }
    }
  ];
};
