require('d3');
var _ = require('lodash');

var MAX_TICKS = 10;

module.exports = function(options) {
  var styleConfig = options.style;
  var seriesConfig = options.series;

  var width = styleConfig.width - styleConfig.margin.left - styleConfig.margin.right,
      height = styleConfig.height - styleConfig.margin.top - styleConfig.margin.bottom;

  var scale = {
    x: seriesConfig.x.scale.range([0, width]),
    y: seriesConfig.y.scale.range([height, 0])
  };

  var pointValue = {
    x: function(dataPoint) { return dataPoint[seriesConfig.x.valueProperty]; },
    y: function(dataPoint) { return dataPoint[seriesConfig.y.valueProperty]; }
  };

  this.setDataDomain = function(series) {
    var keys = _.compact(_.map(series, function(d) { return d.name; }));
    styleConfig.colorScale.domain(keys);
    if (!_.isEmpty(keys)) {
      this.legend = {
        data: keys,
        transform: function(d, i) { return 'translate(0,' + i * 20 + ')'; },
        circle: {
          radius: 5,
          position: { x: width + 30, y: 9 },
          fillColor: styleConfig.colorScale
        },
        label: {
          position: { x: width + 20, y: 9 },
          text: _.identity
        }
      };
    }

    var dataArray = _.reduce(series, function(values, s) {
      return _.uniq(values.concat(s.values));
    }, []);

    scale.x.domain(d3.extent(dataArray, pointValue.x));
    scale.y.domain([0, d3.max(dataArray, pointValue.y)]);
    if (dataArray.length < MAX_TICKS) {
      this.axis.x.value.ticks(dataArray.length);
    }
  };

  this.svgTransform = 'translate(' + styleConfig.margin.left + ',' + styleConfig.margin.top + ')';
  this.axis = {
    x: {
      class: 'x axis',
      transform: 'translate(0,' + height + ')',
      label: {
        class: 'label',
        text: seriesConfig.x.axisLabel,
        position: { x: width + 50, y: 10 }
      },
      value: d3.svg.axis().scale(scale.x).tickFormat(styleConfig.tickFormat.x).orient("bottom")
    },
    y: {
      class: 'y axis',
      transform: 'rotate(-90)',
      label: {
        class: 'label',
        text: seriesConfig.y.axisLabel,
        position: { y: -50 }
      },
      value: d3.svg.axis().scale(scale.y).orient("left")
    }
  };

  this.dataPoints = function(series) {
    var line = d3.svg.line().interpolate("basis")
      .x(function(dataPoint) { return scale.x(pointValue.x(dataPoint)); })
      .y(function(dataPoint) { return scale.y(pointValue.y(dataPoint)); });

    return line(series.values);
  };

  this.seriesColor = function(series) {
    return styleConfig.colorScale(series.name);
  };
};
