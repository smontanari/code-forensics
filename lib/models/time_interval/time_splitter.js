/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    CFValidationError = require('../../runtime/errors').CFValidationError;

module.exports = function(dateFromMoment, dateToMoment) {
  var normalisePeriod = function(startDate, endDate) {
    return {
      start: startDate.clone().startOf('day'),
      end:   endDate.clone().endOf('day')
    };
  };

  var multiplierMatcher = function(match) { return parseInt(match[1]); };

  var TIMESPLIT_STRATEGIES = [
    { regexp: /^eoy$/,    period: 'year', factor: 'years', logicalSplit: true },
    { regexp: /^eoq$/,    period: 'quarter', factor: 'quarter', logicalSplit: true },
    { regexp: /^eom$/,    period: 'month', factor: 'months', logicalSplit: true },
    { regexp: /^eow$/,    period: 'isoWeek', factor: 'weeks', logicalSplit: true },
    { regexp: /^eod$/,    period: 'day', factor: 'days', logicalSplit: true },
    { regexp: /^(\d+)y$/, period: 'year', factor: 'years', logicalSplit: false },
    { regexp: /^(\d+)q$/, period: 'quarter', factor: 'quarters', logicalSplit: false },
    { regexp: /^(\d+)m$/, period: 'month', factor: 'months', logicalSplit: false },
    { regexp: /^(\d+)w$/, period: 'week', factor: 'weeks', logicalSplit: false },
    { regexp: /^(\d+)d$/, period: 'day', factor: 'days', logicalSplit: false }
  ];

  var makePeriods = function(strategy, timeSplit) {
    var periods = [];
    var workingDate = dateFromMoment.clone().startOf('day');
    var targetEndDate = dateToMoment.clone().endOf('day');

    while (workingDate.isBefore(targetEndDate)) {
      var periodStart = workingDate.clone();
      if (strategy.logicalSplit) {
        workingDate.endOf(strategy.period);
      } else {
        var multiplier = multiplierMatcher(strategy.regexp.exec(timeSplit));
        workingDate.add(multiplier, strategy.factor);
        workingDate.subtract(1, 'milliseconds');
      }
      if (workingDate.isAfter(targetEndDate)) {
        workingDate = targetEndDate.clone();
      }
      var periodEnd = workingDate.clone();
      periods.push(normalisePeriod(periodStart, periodEnd));
      workingDate.add(1, 'days').startOf('day');
    }
    return periods;
  };

  this.split = function(timeSplit) {
    if (_.isUndefined(timeSplit)) return [normalisePeriod(dateFromMoment, dateToMoment)];
    var strategy = _.find(TIMESPLIT_STRATEGIES, function(str) {
      return str.regexp.test(timeSplit);
    });
    if (_.isUndefined(strategy)) {
      throw new CFValidationError('Invalid timeSplit value: ' + timeSplit);
    }
    return makePeriods(strategy, timeSplit);
  };
};
