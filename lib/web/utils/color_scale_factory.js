/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    d3 = require('d3');

var RotatingSequence = require('./rotating_sequence.js');

var DEFAULT_COLOR_GROUPS = _.map(d3.schemeCategory10, function(c) {
  var h = d3.hsl(c);
  return [d3.hsl(h.h, h.s, 0.30), d3.hsl(h.h, h.s, 0.80)];
});

module.exports = {
  defaultOrdinal: function(valuesRange, scheme) {
    var schemeCategory = scheme || d3.schemeCategory10;
    var scale = d3.scaleOrdinal(schemeCategory);
    if (valuesRange) {
      scale.domain(valuesRange);
    }
    return scale;
  },
  gradientLinear: function(domain, colorsRange) {
    return d3.scaleLinear()
      .domain(domain)
      .range(colorsRange)
      .interpolate(d3.interpolateHsl);
  },
  defaultGradientOrdinalGroups: function(domainGroups) {
    var colorsGroupSequence = new RotatingSequence(DEFAULT_COLOR_GROUPS);
    return _.mapValues(domainGroups, function(domainValues) {
      var colorScale = d3.scaleLinear()
      .domain([0, domainValues.length - 1])
      .range(colorsGroupSequence.next())
      .interpolate(d3.interpolateHsl);

      return function(value) {
        return colorScale(_.indexOf(domainValues, value));
      };
    });
  },
  sequentialRainbow: function(values) {
    var colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, values.length + 1]);
    return function(value) {
      return colorScale(_.indexOf(values, value));
    };
  }
};
