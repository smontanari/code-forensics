/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    isStream  = require('is-stream'),
    Bluebird  = require('bluebird'),
    reporting = require('../../../reporting'),
    logger    = require('../../../log'),
    utils     = require('../../../utils');


module.exports = function(task, context) {
  var doNothing = function(done) { done(); };
  var publishReport = function(done) {
    var publisher = new reporting.Publisher(task, context);

    try {
      var returnedValue = task.run.call(null, publisher);
      var promise = isStream(returnedValue) ? utils.stream.streamToPromise(returnedValue) : Bluebird.resolve(returnedValue);

      return promise
        .then(publisher.createManifest.bind(publisher))
        .catch(logger.error);
    } catch (e) {
      logger.error(e);
      done();
    }
  };

  if (_.isFunction(task.run)) {
    this.run = publishReport;
  } else {
    this.run = doNothing;
  }
};
