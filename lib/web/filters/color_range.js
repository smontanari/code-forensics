var ko = require('knockout'),
    _  = require('lodash');

var BaseFilter        = require('./base_filter.js'),
    ColorScaleFactory = require('../utils/color_scale_factory.js');

var Filter = function(label) {
  BaseFilter.call(this, label);
};

Filter.prototype = Object.create(BaseFilter.prototype);

Filter.prototype.init = function(valuesArray) {
  var self = this;
  var colorScale = ColorScaleFactory.rainbow(valuesArray);

  this.colorMap = _.map(valuesArray, function(value) {
    return { name: value, color: colorScale(value), isVisible: ko.observable(true) };
  });

  this.select = function(data) {
    if (_.every(self.colorMap, _.method('isVisible'))) {
      var nonSelectedItems = _.filter(self.colorMap, function(item) { return item.name !== data.name; });
      _.each(nonSelectedItems, function(item) {
        item.isVisible(false);
      });
      self.inputValue(data.name);
    } else {
      _.each(self.colorMap, function(item) { item.isVisible(true); });
      self.inputValue(null);
    }
  };
};

module.exports = Filter;
