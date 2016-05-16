var ko = require('knockout');
var MetricRange = require('./metric_range.js');

module.exports = function() {
  var self = this;
  MetricRange.apply(this, arguments);

  this.displayValue = ko.pureComputed(function() {
    return Math.round(self.range.max * parseInt(self.inputContinuousValue()) / 100);
  });
};
