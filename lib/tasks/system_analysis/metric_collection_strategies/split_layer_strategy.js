/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    map               = require('through2-map'),
    TimePeriodResults = require('./time_period_results');

module.exports = function(streamProcessor, helpers, options) {
  var transformFn = TimePeriodResults.resultsMerger(options.metrics.selector);

  return function(timePeriods) {
    var iterator = _.flatMap(timePeriods, function(period) {
      return options.layerGrouping.map(function(layer) {
        return { timePeriod: period, layer: layer };
      });
    });

    return streamProcessor.mergeAll(iterator, function(item) {
      var period = item.timePeriod;
      var layer = item.layer;
      var vcsLogFile = helpers.files.vcsNormalisedLog(period);
      return helpers.codeMaat[options.analysis](vcsLogFile, helpers.files.layerGrouping(layer.name))
        .pipe(transformFn(period))
        .pipe(map.obj(function(obj) {
          return _.defaults(obj, { name: layer.value }, options.metrics.defaultValue);
        }));
    });
  };
};
