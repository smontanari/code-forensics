/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

 var _                 = require('lodash'),
    pp                 = require('../../../parallel_processing'),
    noLayerStrategy    = require('./no_layer_strategy'),
    splitLayerStrategy = require('./split_layer_strategy'),
    multiLayerStrategy = require('./multi_layer_strategy'),
    TimePeriodResults  = require('./time_period_results');

var strategyObject = function(helpers, options) {
  return {
    isSupported: function() { return helpers.codeMaat[options.analysis].isSupported(); },
    accumulator: TimePeriodResults.resultsAccumulator(options.metrics.accumulatorsMap)
  };
};

var createStrategy = function(collectStrategyFn) {
  return function(helpers, options) {
    return _.tap(strategyObject(helpers, options), function(strategy) {
      var streamProcessor = pp.streamProcessor();
      strategy.collect = collectStrategyFn(streamProcessor, helpers, options);
    });
  };
};

module.exports = {
  noLayer:    createStrategy(noLayerStrategy),
  multiLayer: createStrategy(multiLayerStrategy),
  splitLayer: createStrategy(splitLayerStrategy)
};
