var d3 = require('d3');

module.exports = {
  default: function(valuesRange) {
    var scale = d3.scaleOrdinal(d3.schemeCategory10);
    if (valuesRange) {
      scale.domain(valuesRange);
    }
    return scale;
  },
  gradient: function(domain, colorsRange) {
    return d3.scaleLinear()
      .domain(domain)
      .range(colorsRange)
      .interpolate(d3.interpolateHcl);
  },
  rainbow: function(values) {
    var colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, values.length + 1]);
    return function(value) {
      return colorScale(_.indexOf(values, value));
    }
  }
};
