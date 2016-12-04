var ko = require('knockout'),
    _  = require('lodash');

var BaseFilter = require('./base_filter.js');

var Filter = function() {
  BaseFilter.call(this);

  this.defineMinMax = true;
  this.range = ko.observable({ min: 0, max: 0 });
};

Filter.prototype = Object.create(BaseFilter.prototype);
Filter.prototype.init = function(valuesArray) {
  this.range({ min: _.min(valuesArray), max: _.max(valuesArray) });
  this.inputValue(this.range().min);
};

module.exports = Filter;
