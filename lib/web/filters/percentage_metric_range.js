var ko = require('knockout');
var MetricRange = require('./metric_range.js');

module.exports = function() {
  var self = this;
  MetricRange.apply(this, arguments);

  this.range.min = 0;
  this.range.max = 1;

  this.displayValue = ko.pureComputed(function() {
    return Math.round(self.range.max * parseInt(self.inputContinuousValue()));
  });
};

