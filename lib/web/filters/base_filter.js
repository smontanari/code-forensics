var ko = require('knockout');

module.exports = function(label) {
  this.label = label;

  this.inputValue = ko.observable();
  this.outputValue = this.inputValue;

  this.init = function() {};
};
