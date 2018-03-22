/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    isStream  = require('is-stream'),
    Bluebird  = require('bluebird'),
    reporting = require('../../../reporting'),
    logger    = require('../../../log').Logger,
    utils     = require('../../../utils');

module.exports = function(task, context) {
  this.run = function(done) {
    var publisher = new reporting.Publisher(task, context);

    if (_.isFunction(task.run)) {
      try {
        var returnedValue = task.run.call(null, publisher, done);
        var promise = isStream(returnedValue) ? utils.stream.streamToPromise(returnedValue) : Bluebird.resolve(returnedValue);

        return promise
          .then(publisher.createManifest.bind(publisher))
          .catch(logger.error);
      } catch (e) { logger.error(e); }
    }
    done();
  };
};
