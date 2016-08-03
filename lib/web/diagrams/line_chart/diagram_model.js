require('d3');
var _ = require('lodash');

var MAX_TICKS = 10;

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

  var keys = _.compact(_.map(series, function(d) { return d.name; }));

  if (!_.isEmpty(keys)) {
    styleConfig.colorScale.domain(keys);
    this.legend = {
      data: keys,
      transform: function(d, i) { return 'translate(0,' + i * 20 + ')'; },
      circle: {
        radius: 5,
        position: { x: actualWidth + 30, y: 9 },
        fillColor: styleConfig.colorScale
      },
      label: {
        position: { x: actualWidth + 20, y: 9 },
        text: _.identity
      }
    };
  }

  this.width = styleConfig.width;
  this.height = styleConfig.height;
  this.series = series;

  this.svgTransform = 'translate(' + styleConfig.margin.left + ',' + styleConfig.margin.top + ')';
  this.axis = {
    x: {
      class: 'x axis',
      transform: 'translate(0,' + actualHeight + ')',
      label: {
        class: 'label',
        text: seriesConfig.x.axisLabel,
        position: { x: actualWidth + 50, y: 10 }
      },
      value: d3.svg.axis().scale(scale.x).tickFormat(styleConfig.tickFormat.x).orient('bottom')
    },
    y: {
      class: 'y axis',
      transform: 'rotate(-90)',
      label: {
        class: 'label',
        text: seriesConfig.y.axisLabel,
        position: { y: -50 }
      },
      value: d3.svg.axis().scale(scale.y).orient('left').innerTickSize(-actualWidth)
    }
  };

  if (dataArrayX.length < MAX_TICKS) {
    this.axis.x.value.ticks(dataArrayX.length);
  }

  this.dataPoints = function(series) {
    var line = d3.svg.line().interpolate('basis')
      .x(function(dataPoint) { return scale.x(dataPoint[seriesConfig.x.valueProperty]); })
      .y(function(dataPoint) { return scale.y(dataPoint[seriesConfig.y.valueProperty]); });

    return line(series.values);
  };

  this.seriesColor = function(series) {
    return styleConfig.colorScale(series.name);
  };
};
