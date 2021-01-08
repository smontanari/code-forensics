/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var METRICS = ['revisions', 'commits', 'authors'];

module.exports = {
  selector: function(obj) {
    return _.reduce(METRICS, function(metric, key) {
      if (obj.stat === key && obj.value) {
        metric[key] = obj.value;
      }
      return metric;
    }, {});
  },
  defaultValue: _.reduce(METRICS, function(metric, key) {
    metric[key] = 0;
    return metric;
  }, {}),
  accumulatorsMap: _.reduce(METRICS, function(metric, key) {
    var metricName = _.camelCase(['cumulative', key]);
    metric[metricName] = _.property(key);
    return metric;
  }, {})
};
