var ko = require('knockout');

module.exports = function(label) {
  var self = this;
  this.label = label;
  this.range = { min: 0, max: 0 };

  this.inputChangeValue = ko.observable(0);
  this.inputContinuousValue = ko.observable(0);
  this.outputValue = ko.pureComputed(function() {
    return self.range.max * parseInt(self.inputChangeValue()) / 100;
  });

  this.init = function(min, max) {
    this.range.min = min;
    this.range.max = max;
  };
};
