var _                 = require('lodash'),
    CFValidationError = require('../validation_error');

module.exports = function(dateFromMoment, dateToMoment) {
  var frequencyStrategy = {
    daily: { period: 'day', multiplier: 1},
    weekly: { period: 'week', multiplier: 1},
    fortnightly: { period: 'week', multiplier: 2},
    monthly: { period: 'month', multiplier: 1},
    bimestrial: { period: 'month', multiplier: 2},
    trimestrial: { period: 'month', multiplier: 3},
    semiannual: { period: 'month', multiplier: 6},
    yearly: { period: 'year', multiplier: 1}
  };

  var makePeriods = function(strategy) {
    var periods = [];
    var workingDate = dateFromMoment.clone();
    var shiftWorkingDate = function(n) {
      if (n > 0) workingDate.add(1, 'days');
      workingDate.endOf(strategy.period);
    };

    while (workingDate.isBefore(dateToMoment)) {
      var periodStart = workingDate.clone();
      _.times(strategy.multiplier, shiftWorkingDate);
      if (workingDate.isAfter(dateToMoment)) {
        workingDate = dateToMoment;
      }
      var periodEnd = workingDate.clone();
      periods.push({start: periodStart, end: periodEnd});
      workingDate.add(1, 'days');
    }
    return periods;
  };

  this.split = function(frequency) {
    if (_.isUndefined(frequency)) return [{ start: dateFromMoment, end: dateToMoment }];
    if (_.isUndefined(frequencyStrategy[frequency])) {
      throw new CFValidationError('Invalid frequency value: ' + frequency);
    }
    return makePeriods(frequencyStrategy[frequency]);
  };
};
