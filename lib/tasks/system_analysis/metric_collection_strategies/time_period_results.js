/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var map    = require('through2-map'),
    reduce = require('through2-reduce'),
    _      = require('lodash');

var MetricsAccumulator = function(metricsMap) {
  var totals = {};
  var initAccumulators = function() {
    return _.reduce(_.keys(metricsMap), function(obj, key) {
      obj[key] = 0;
      return obj;
    }, {});
  };

  this.next = function(obj) {
    var accumulatorKey = obj.name;
    if (!totals[accumulatorKey]) {
      totals[accumulatorKey] = initAccumulators();
    }
    _.each(metricsMap, function(accFn, key) {
      var accValue = accFn(obj);
      if (_.isNumber(accValue)) {
        totals[accumulatorKey][key] += accValue;
      }
    });
    return _.assign(obj, totals[accumulatorKey]);
  };
};

module.exports = {
  resultsMapper: function(metricsSelector) {
    return function(period) {
      return map.obj(function(obj) {
        var results = metricsSelector(obj);
        return _.assign({
          name: obj.path,
          date: period.toISOFormat().endDate
        }, results);
      });
    };
  },
  resultsMerger: function(metricsSelector) {
    return function(period) {
      return reduce.obj(function(previous, obj) {
        var results = metricsSelector(obj);
        return _.defaults({
          name: obj.path,
          date: period.toISOFormat().endDate
        }, results, previous);
      }, {});
    };
  },
  resultsReducer: function(metricsSelector, defaultValue) {
    return function(period) {
      return reduce.obj(function(previous, obj) {
        return _.reduce(metricsSelector(obj),
          function(aggregateObj, value, key) {
            aggregateObj[key] += value;
            return aggregateObj;
          }, previous);
        }, _.assign({
          name: 'All files',
          date: period.toISOFormat().endDate
        }, defaultValue)
      );
    };
  },
  resultsAccumulator: function(metricsAccumulatorMap) {
    var accumulator = new MetricsAccumulator(metricsAccumulatorMap);
    return map.obj(accumulator.next.bind(accumulator));
  }
};
