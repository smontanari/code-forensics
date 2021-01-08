/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var ScaleDomainFactory = require('../../utils/scale_domain_factory.js');

module.exports = function(config) {
  var seriesConfig = config.series;

  var reduceAxisData = function(seriesGroups, axis) {
    return _.reduce(seriesGroups, function(values, group) {
      var allValues = values.concat(_.map(group.allValues(), seriesConfig[axis].valueProperty));
      return _.uniqBy(allValues, seriesConfig[axis].valueCompareFn || _.identity);
    }, []);
  };

  this.createPlotLine = function(scale) {
    var line = d3.line().curve(config.plotLine.curve)
      .x(function(dataPoint) { return scale.x(dataPoint[seriesConfig.x.valueProperty]); })
      .y(function(dataPoint) { return scale.y(dataPoint[seriesConfig.y.valueProperty]); });

    return function(data) { return line(data.allValues()); };
  };

  this.createScale = function(seriesGroups, width, height) {
    var dataArrayX = reduceAxisData(seriesGroups, 'x');
    var dataArrayY = reduceAxisData(seriesGroups, 'y');
    return {
      x: seriesConfig.x.scale().range([0, width]).domain(ScaleDomainFactory(dataArrayX, seriesConfig.x.domainFactory)),
      y: seriesConfig.y.scale().range([height, 0]).domain(ScaleDomainFactory(dataArrayY, seriesConfig.y.domainFactory))
    };
  };
};
