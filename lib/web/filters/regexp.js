/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

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
Filter.prototype.init = function() {
  this.hasData(true);
};

module.exports = Filter;
