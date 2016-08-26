var ko = require('knockout');
var MetricRangeFilter = require('./metric_range.js');

module.exports = function(label) {
  var self = this;
  MetricRangeFilter.call(this, label);

  this.displayValue = ko.pureComputed(function() {
    return Math.round(self.range.max * parseInt(self.inputContinuousValue()));
  });

  this.init = function() {
    this.range = { min: 0, max: 1 };
  };
};
