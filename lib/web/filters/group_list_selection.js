/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout'),
    _  = require('lodash');

var BaseFilter = require('./base_filter.js');

var Filter = function(groupKey) {
  BaseFilter.call(this);
  this.groupKey = groupKey;
};

Filter.prototype = Object.create(BaseFilter.prototype);

Filter.prototype.init = function(valuesArray) {
  this.listValues = _.map(valuesArray, function(value) {
    return { name: value, isSelected: ko.observable(true) };
  });

  this.hasData(valuesArray.length > 1);

  this.select = function(data) {
    var item = _.find(this.listValues, { 'name': data.name });
    item.isSelected(!item.isSelected());
    var allSelectedItems = _.filter(this.listValues, _.method('isSelected'));
    this.outputValue(_.map(allSelectedItems, 'name'));
  };
};

module.exports = Filter;
