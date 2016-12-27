var _                 = require('lodash'),
    CFValidationError = require('../validation_error');

module.exports = function(dateFromMoment, dateToMoment) {
  var FREQUENCY_STRATEGIES = [
    { keys: ['1d', 'daily'],       splitInfo: { period: 'day', multiplier: 1 } },
    { keys: ['1w', 'weekly'],      splitInfo: { period: 'week', multiplier: 1 } },
    { keys: ['2w', 'fortnightly'], splitInfo: { period: 'week', multiplier: 2 } },
    { keys: ['1m', 'monthly'],     splitInfo: { period: 'month', multiplier: 1 } },
    { keys: ['2m', 'bimonthly'],   splitInfo: { period: 'month', multiplier: 2 } },
    { keys: ['3m', 'quarterly'],   splitInfo: { period: 'month', multiplier: 3 } },
    { keys: ['6m', 'semiannual'],  splitInfo: { period: 'month', multiplier: 6 } },
    { keys: ['1y', 'yearly'],      splitInfo: { period: 'year', multiplier: 1 } }
  ];

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
    var strategy = _.find(FREQUENCY_STRATEGIES, function(str) {
      return _.includes(str.keys, frequency);
    });
    if (_.isUndefined(strategy)) {
      throw new CFValidationError('Invalid frequency value: ' + frequency);
    }
    return makePeriods(strategy.splitInfo);
  };
};
