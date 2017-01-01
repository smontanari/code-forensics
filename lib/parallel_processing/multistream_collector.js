/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _           = require('lodash'),
    PassThrough = require('stream').PassThrough,
    logger      = require('../log').Logger,
    utils       = require('../utils');

var SequenceCounter = function(targetNumber, onEndCallback) {
  var count = 0;

  var checkForEndSequence = function() {
    if (count === targetNumber) {
      onEndCallback();
    }
  };

  this.next = function() {
    count++;
    checkForEndSequence();
  };

  checkForEndSequence();
};

module.exports = function(jobRunner, streamOptions) {
  var collectorStream = new PassThrough(streamOptions);
  var counter;

  var processStream = function(stream) {
    stream.on('data', function(chunk) { collectorStream.write(chunk); });
    return utils.stream.streamToPromise(stream).then(counter.next.bind(counter), function(err) {
      logger.error('Error processing stream: ' + err);
    });
  };

  this.mergeAll = function(streamFnList) {
    counter = new SequenceCounter(streamFnList.length, collectorStream.end.bind(collectorStream));
    _.each(streamFnList, function(streamFn) {
      jobRunner.addJob(function() {
        return processStream(streamFn());
      });
    });
    return collectorStream;
  };
};
