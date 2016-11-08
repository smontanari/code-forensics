var ko = require('knockout');

var MetricRangeFilter = require('./metric_range.js');

var Filter = function(label) {
  var self = this;
  MetricRangeFilter.call(this, label);

  this.defineMinMax = false;

  this.displayValue = ko.pureComputed(function() {
    return Math.round(self.range().max * parseInt(self.inputValue()));
  });
  this.outputValue = ko.pureComputed(function() {
    return self.range().max * parseInt(self.inputValue()) / 100;
  });
};

Filter.prototype.init = function() {
  MetricRangeFilter.prototype.init.call(this, [0, 1]);
};

module.exports = Filter;
