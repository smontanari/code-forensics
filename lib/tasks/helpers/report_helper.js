var isStream  = require('is-stream'),
    Q         = require('q'),
    reporting = require('../../reporting'),
    utils     = require('../../utils');

module.exports = function(context) {
  this.publish = function(reportType, reportGenerator) {
    var publisher = new reporting.Publisher(reportType, context);
    var createManifest = publisher.createManifest.bind(publisher);
    var returnedValue = reportGenerator(publisher);

    var promise = isStream(returnedValue) ? utils.stream.streamToPromise(returnedValue) : Q(returnedValue);
    return promise.then(createManifest);
  };
};
