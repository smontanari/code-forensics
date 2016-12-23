var moment            = require('moment'),
    _                 = require('lodash'),
    CFValidationError = require('../validation_error'),
    TimePeriod        = require('./time_period'),
    TimeSplitter      = require('./time_splitter');

module.exports = function(dateFormat) {
  var frequency,
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

  this.split = function(freq) {
    frequency = freq;
    return this;
  };

  this.build = function() {
    if (dateTo.isBefore(dateFrom)) {
      throw new CFValidationError('The to Date (' + dateTo.toString() + ') cannot be before than the from Date (' + dateFrom.toString() + ')');
    }

    return _.map(new TimeSplitter(dateFrom, dateTo).split(frequency), function(period) {
      return new TimePeriod(period.start.format(dateFormat), period.end.format(dateFormat));
    });
  };
};
