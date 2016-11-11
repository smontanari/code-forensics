var ko = require('knockout');

var BaseFilter = require('./base_filter.js');

var Filter = function(label) {
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

Filter.prototype = Object.create(BaseFilter.prototype);

module.exports = Filter;
