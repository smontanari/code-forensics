/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

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
  this.hasData(valuesArray.length > 1);
  this.range({ min: _.min(valuesArray), max: _.max(valuesArray) });
  this.inputValue(this.range().min);
};

module.exports = Filter;
