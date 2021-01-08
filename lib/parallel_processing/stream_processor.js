/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Bluebird = require('bluebird'),
    merge2   = require('merge2'),
    logger   = require('../log'),
    utils    = require('../utils');

module.exports = function(jobScheduler) {
  this.mergeAll = function(iterable, streamFn) {
    var mergedStream = merge2({ end: false });
    var streamPromises = _.map(iterable, function(item) {
      return jobScheduler.addJob(function() {
        var stream = streamFn(item);
        mergedStream.add(stream);
        return utils.stream.streamToPromise(stream)
          .catch(function(err) {
            logger.warn(err);
          });
      });
    });

    Bluebird.all(streamPromises).then(function() {
      mergedStream.end();
    });
    return mergedStream;
  };

  this.process = function(streamFn) {
    return jobScheduler.addJob(function() {
      return utils.stream.streamToPromise(streamFn());
    }).reflect();
  };

  this.processAll = function(iterable, streamFn) {
    var self = this;
    var streamPromises = _.map(iterable, function(item) {
      return self.process(_.wrap(item, streamFn));
    });
    return Bluebird.all(streamPromises);
  };

  this.read = function(streamFn) {
    return jobScheduler.addJob(function() {
      return utils.stream.objectStreamToArray(streamFn());
    });
  };
};
