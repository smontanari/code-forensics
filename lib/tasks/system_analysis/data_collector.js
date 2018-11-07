/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var sortStream = require('sort-stream2'),
    filter     = require('through2-filter'),
    moment     = require('moment'),
    Bluebird   = require('bluebird'),
    pp         = require('../../parallel_processing'),
    utils      = require('../../utils');

module.exports = function(timePeriods) {
  this.collectDataStream = function(collectionStrategy) {
    return new Bluebird(function(resolve, reject) {
      if (collectionStrategy.isSupported()) {
        return resolve(pp.objectStreamCollector()
          .mergeAll(utils.arrays.arrayToFnFactory(timePeriods, function(period) {
            return collectionStrategy.collect(period);
          }))
          .pipe(filter.obj(function(obj) { return obj.date && moment(obj.date, moment.ISO_8601).isValid(); }))
          .pipe(sortStream(function(a, b) { return moment(a.date, moment.ISO_8601).diff(moment(b.date, moment.ISO_8601)); }))
          .pipe(collectionStrategy.accumulator));
      }
      return reject('Data analysis not supported');
    });
  };
};
