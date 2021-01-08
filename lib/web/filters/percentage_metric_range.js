/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout');

var MetricRangeFilter = require('./metric_range.js');

var Filter = function() {
  var self = this;
  MetricRangeFilter.call(this);

  this.defineMinMax = false;

  this.displayValue = ko.pureComputed(function() {
    return Math.round(self.range().max * parseInt(self.inputValue()));
  });
  this.outputValue = ko.pureComputed(function() {
    return self.range().max * parseInt(self.inputValue()) / 100;
  });
};

Filter.prototype = Object.create(MetricRangeFilter.prototype);
Filter.prototype.init = function() {
  MetricRangeFilter.prototype.init.call(this, [0, 1]);
};

module.exports = Filter;
