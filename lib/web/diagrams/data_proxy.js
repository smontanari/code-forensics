/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Q = require('q'),
    _ = require('lodash');

var defaultLayoutAdapter = { toSeries: Q };

module.exports = function(layoutAdapter, dataTransform) {
  var adapter = layoutAdapter || defaultLayoutAdapter;
  var transformFn = dataTransform || _.identity;

  this.processData = function(data) {
    return adapter.toSeries(data).then(transformFn);
  };
};
