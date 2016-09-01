var ko = require('knockout'),
    _  = require('lodash');

var MetricRangeFilter = require('./metric_range.js');

module.exports = function(label) {
  var self = this;
  MetricRangeFilter.call(this, label);

  this.displayValue = ko.pureComputed(function() {
    return Math.round(self.range.max * parseInt(self.inputContinuousValue()) / 100);
  });

  this.init = function(valuesArray) {
    this.range = { min: _.min(valuesArray), max: _.max(valuesArray) };
  };
};
