/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    camelcase = require('camelcase');

var METRICS = ['revisions', 'commits', 'authors'];

module.exports = {
  metricCollector: function(obj) {
    return _.reduce(METRICS, function(metric, key) {
      metric[key] = obj.stat === key ? obj.value : 0;
      return metric;
    }, {});
  },
  metricInitialValue: _.reduce(METRICS, function(metric, key) {
    metric[key] = 0;
    return metric;
  }, {}),
  metricAccumulatorsMap: _.reduce(METRICS, function(metric, key) {
    var metricName = camelcase(['cumulative', key]);
    metric[metricName] = _.property(key);
    return metric;
  }, {})
};
