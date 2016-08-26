var ko = require('knockout');

var BaseFilter = require('./base_filter.js');

module.exports = function(label) {
  var self = this;
  BaseFilter.call(this, label);

  this.range = { min: 0, max: 0 };
  this.inputChangeValue = ko.observable(0);
  this.inputContinuousValue = ko.observable(0);
  this.outputValue = ko.pureComputed(function() {
    return self.range.max * parseInt(self.inputChangeValue()) / 100;
  });
};
