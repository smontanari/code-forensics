/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var TimePeriodResults = require('./time_period_results');

module.exports = function(metrics, codeMaatAnalysis, helpers) {
  var transformFn = TimePeriodResults.resultsMapper(metrics.selector);
  var groupParam = { '-g': helpers.files.layerGrouping() };

  return function(period) {
    var vcsLogFile = helpers.files.vcsNormalisedLog(period);
    return helpers.codeMaat[codeMaatAnalysis](vcsLogFile, groupParam)
      .pipe(transformFn(period));
  };
};
