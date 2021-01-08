/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function() {
  var REGEXP = /^\s+(\d+\.\d+): (.*)$/;

  var readLine = function(line) {
    var match = REGEXP.exec(line);
    if (match) {
      return {
        label: match[2],
        value: parseFloat(match[1])
      };
    }
  };

  this.read = function(content) {
    var lines = content.split('\n');
    return _.reduce(lines, function(result, line) {
      var metric = readLine(line);
      if (metric) {
        if (metric.label === 'flog total') {
          result.totalComplexity = metric.value;
        } else if (metric.label === 'flog/method average') {
          result.averageComplexity = metric.value;
        } else {
          result.methodComplexity.push({ name: metric.label, complexity: metric.value });
        }
      }
      return result;
    }, { methodComplexity: [] });
  };
};
