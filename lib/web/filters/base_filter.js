/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout');

var Filter = function() {
  this.hasData = ko.observable(false);
  this.inputValue = ko.observable();
  this.outputValue = this.inputValue;
  this.displayValue = this.inputValue;
};

Filter.prototype.init = function() {};

module.exports = Filter;
