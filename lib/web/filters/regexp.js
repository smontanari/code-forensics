var ko = require('knockout');

var BaseFilter = require('./base_filter.js');

var Filter = function() {
  var self = this;
  BaseFilter.call(this);

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
