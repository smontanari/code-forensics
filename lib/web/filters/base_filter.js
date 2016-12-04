var ko = require('knockout');

var Filter = function() {
  this.inputValue = ko.observable();
  this.outputValue = this.inputValue;
  this.displayValue = this.inputValue;
};

Filter.prototype.init = function() {};

module.exports = Filter;
