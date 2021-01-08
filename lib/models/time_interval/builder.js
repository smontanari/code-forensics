/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var moment            = require('moment'),
    _                 = require('lodash'),
    CFValidationError = require('../../runtime/errors').CFValidationError,
    TimePeriod        = require('./time_period'),
    TimeSplitter      = require('./time_splitter');

module.exports = function(dateFormat) {
  var timeSplit,
      dateFrom = moment(),
      dateTo = moment();

  var parseDate = function(d) {
    var date = moment(d, dateFormat);
    if (!date.isValid()) {
      throw new CFValidationError('Error parsing date: ' + d);
    }
    return date;
  };

  this.from = function(from) {
    if (_.isString(from)) {
      dateFrom = parseDate(from);
    }
    return this;
  };

  this.to = function(to) {
    if (_.isString(to)) {
      dateTo = parseDate(to);
    }
    return this;
  };

  this.split = function(split) {
    timeSplit = split;
    return this;
  };

  this.build = function() {
    if (dateTo.isBefore(dateFrom)) {
      throw new CFValidationError('The to Date (' + dateTo.toString() + ') cannot be before than the from Date (' + dateFrom.toString() + ')');
    }

    return _.map(new TimeSplitter(dateFrom, dateTo).split(timeSplit), function(period) {
      return new TimePeriod(period, dateFormat);
    });
  };
};
