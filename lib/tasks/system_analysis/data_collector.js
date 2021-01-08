/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var sortStream = require('sort-stream2'),
    filter     = require('through2-filter'),
    moment     = require('moment'),
    Bluebird   = require('bluebird');

module.exports = function(timePeriods) {
  this.collectDataStream = function(collectionStrategy) {
    return new Bluebird(function(resolve, reject) {
      if (collectionStrategy.isSupported()) {
        resolve(collectionStrategy.collect(timePeriods)
          .pipe(filter.obj(function(obj) { return obj.date && moment(obj.date, moment.ISO_8601).isValid(); }))
          .pipe(sortStream(function(a, b) { return moment(a.date).diff(moment(b.date)); }))
          .pipe(collectionStrategy.accumulator));
      }
      reject('Data analysis not supported');
    });
  };
};
