var ko = require('knockout');

var Filter = function(label) {
  this.label = label;

  this.inputValue = ko.observable();
  this.outputValue = this.inputValue;
  this.displayValue = this.inputValue;
};

Filter.prototype.init = function() {};

module.exports = Filter;
