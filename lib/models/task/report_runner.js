var _         = require('lodash'),
    isStream  = require('is-stream'),
    Q         = require('q'),
    reporting = require('../../reporting'),
    utils     = require('../../utils');

module.exports = function(task, context) {
  this.run = function(argsArray) {
    var publisher = new reporting.Publisher(task, context);

    var returnedValue = task.taskFunction.apply(null, [publisher].concat(_.toArray(argsArray)));
    var promise = isStream(returnedValue) ? utils.stream.streamToPromise(returnedValue) : Q(returnedValue);

    return promise.then(publisher.createManifest.bind(publisher));
  };
};
