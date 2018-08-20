/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    sortStream        = require('sort-stream2'),
    moment            = require('moment'),
    pp                = require('../../parallel_processing'),
    utils             = require('../../utils'),
    TimePeriodResults = require('./time_period_results');

var mapper = function(metricCollector) {
  return TimePeriodResults.resultsMapper(metricCollector);
};
var reducer = function(metricCollector, initialValue) {
  return TimePeriodResults.resultsReducer(metricCollector, initialValue);
};
var accumulator = function(accumulatorMap) {
  return TimePeriodResults.resultsAccumulator(accumulatorMap);
};

module.exports = function(context, filesHelper, codeMaatHelper) {
  var groupParam = context.layerGrouping.isEmpty() ? {} : { '-g': filesHelper.layerGrouping() };

  this.reportStream = function(analysis) {
    var transformFn = context.layerGrouping.isEmpty() ? reducer(analysis.metricCollector, analysis.initialValue) : mapper(analysis.metricCollector);
    var stream = pp.objectStreamCollector()
      .mergeAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        var s = codeMaatHelper[analysis.codeMaatAnalysis](filesHelper.vcsNormalisedLog(period), groupParam);
        return s.pipe(transformFn.call(null, period));
      })
    );
    if (_.isObject(analysis.accumulators)) {
      stream = stream
        .pipe(sortStream(function(a, b) { return moment(a.date).diff(moment(b.date)); }))
        .pipe(accumulator(analysis.accumulators));
    }
    return stream;
  };
};
