var isStream        = require('is-stream'),
    Q               = require('q'),
    reporting       = require('../../reporting');

module.exports = function(context) {
  this.publish = function(reportType, reportGenerator) {
    var publisher = new reporting.Publisher(reportType, context);
    var createManifest = publisher.createManifest.bind(publisher);
    var returnedValue = reportGenerator(publisher);

    if (isStream(returnedValue)) {
      return returnedValue.on('close', createManifest);
    } else {
      return Q(returnedValue).then(createManifest);
    }
  };
};
