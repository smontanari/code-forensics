var Filters = (function(module) {
  module.MetricRange = function(label) {
    var self = this;
    this.label = label;
    this.range = { min: 0, max: 0 };

    this.inputChangeValue = ko.observable(0);
    this.inputContinuousValue = ko.observable(0);
    this.changeValue = ko.pureComputed(function() {
      return self.range.max * parseInt(self.inputChangeValue()) / 100;
    });
    this.onChange = function(callback) {
      this.changeValue.subscribe(callback);
    };
    this.init = function(min, max) {
      this.range.min = min;
      this.range.max = max;
    };
  };

  module.RoundedMetricRange = function() {
    var self = this;
    module.MetricRange.apply(this, arguments);
    this.displayValue = ko.pureComputed(function() {
      return Math.round(self.range.max * parseInt(self.inputContinuousValue()) / 100);
    });
  };

  module.PercentageMetricRange = function() {
    var self = this;
    module.MetricRange.apply(this, arguments);
    this.displayValue = ko.pureComputed(function() {
      return Math.round(self.range.max * parseInt(self.inputContinuousValue()));
    });
  };

  return module;
})(Filters || {});

