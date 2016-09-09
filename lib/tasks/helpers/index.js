var GraphDataHelper      = require('./graph_data_helper'),
    RevisionStreamHelper = require('./revision_stream_helper'),
    ReportHelper         = require('./report_helper');

module.exports = function(context) {
  return {
    graphDataHelper:      new GraphDataHelper(context),
    revisionStreamHelper: new RevisionStreamHelper(context),
    reportHelper:         new ReportHelper(context)
  };
};
