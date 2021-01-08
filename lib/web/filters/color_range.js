/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout'),
    _  = require('lodash');

var BaseFilter = require('./base_filter.js');

var Filter = function(colorScaleFactory) {
  BaseFilter.call(this);
  this.colorScaleFactory = colorScaleFactory;
};

Filter.prototype = Object.create(BaseFilter.prototype);

Filter.prototype.init = function(valuesArray) {
  var colorScale = this.colorScaleFactory(valuesArray);

  this.hasData(valuesArray.length > 1);
  this.colorMap = _.map(valuesArray, function(value) {
    return { name: value, color: colorScale(value), isVisible: ko.observable(true) };
  });

  this.select = function(data) {
    if (_.every(this.colorMap, _.method('isVisible'))) {
      var nonSelectedItems = _.filter(this.colorMap, function(item) { return item.name !== data.name; });
      _.each(nonSelectedItems, function(item) { item.isVisible(false); });
      this.outputValue(data.name);
    } else {
      _.each(this.colorMap, function(item) { item.isVisible(true); });
      this.outputValue(null);
    }
  };
};

module.exports = Filter;
