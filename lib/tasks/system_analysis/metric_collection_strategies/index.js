/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

 var _                  = require('lodash'),
    noLayerStrategy    = require('./no_layer_strategy'),
    splitLayerStrategy = require('./split_layer_strategy'),
    multiLayerStrategy = require('./multi_layer_strategy'),
    TimePeriodResults  = require('./time_period_results');

var strategyObject = function(metrics, codeMaatAnalysis, helpers) {
  return {
    isSupported: function() { return helpers.codeMaat[codeMaatAnalysis].isSupported(); },
    accumulator: TimePeriodResults.resultsAccumulator(metrics.accumulatorsMap),
  };
};

var createStrategy = function(collectFn) {
  return function() {
    var args = _.toArray(arguments);
    return _.tap(strategyObject.apply(null, args), function(strategy) {
      strategy.collect = collectFn.apply(null, args);
    });
  };
};

module.exports = {
  noLayer:    createStrategy(noLayerStrategy),
  multiLayer: createStrategy(multiLayerStrategy),
  splitLayer: createStrategy(splitLayerStrategy)
};
