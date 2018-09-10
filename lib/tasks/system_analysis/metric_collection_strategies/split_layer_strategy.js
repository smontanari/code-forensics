/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    map               = require('through2-map'),
    merge2            = require('merge2'),
    TimePeriodResults = require('./time_period_results');

module.exports = function(metrics, codeMaatAnalysis, helpers, layerGrouping) {
  var transformFn = TimePeriodResults.resultsMerger(metrics.selector);

  return function(period) {
    var vcsLogFile = helpers.files.vcsNormalisedLog(period);
    var mergeStream = merge2();
    layerGrouping.each(function(layer) {
      var groupParam = { '-g': helpers.files.layerGrouping(layer.name) };
      var analysisStream = helpers.codeMaat[codeMaatAnalysis](vcsLogFile, groupParam)
        .pipe(transformFn(period))
        .pipe(map.obj(function(obj) {
          return _.assign(obj, { name: obj.name || layer.value });
        }));
      mergeStream.add(analysisStream);
    });
    return mergeStream;
  };
};
