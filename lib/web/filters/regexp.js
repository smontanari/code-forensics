var ko = require('knockout');

var BaseFilter = require('./base_filter.js');

module.exports = function(label) {
  var self = this;
  BaseFilter.call(this, label);

  this.outputValue = ko.pureComputed(function() {
    try {
      return new RegExp(self.inputValue());
    } catch(e) {
      return self.inputValue();
    }
  });
};
