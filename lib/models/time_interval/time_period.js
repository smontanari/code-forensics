/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var TimePeriod = function(period, dateFormat) {
  this.startDate = period.start;
  this.endDate = period.end;
  this.dateFormat = dateFormat;
};

TimePeriod.prototype.toString = function() {
  return this.startDate.format(this.dateFormat) + '_' + this.endDate.format(this.dateFormat);
};

TimePeriod.prototype.toDisplayFormat = function() {
  return {
    startDate: this.startDate.format(this.dateFormat),
    endDate: this.endDate.format(this.dateFormat)
  };
};

TimePeriod.prototype.toISOFormat = function() {
  return {
    startDate: this.startDate.toISOString(),
    endDate: this.endDate.toISOString()
  };
};

module.exports = TimePeriod;
