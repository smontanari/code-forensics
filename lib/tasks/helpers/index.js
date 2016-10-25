var GraphDataHelper      = require('./graph_data_helper'),
    RevisionStreamHelper = require('./revision_stream_helper'),
    FilesHelper          = require('./files_helper'),
    DeveloperDataHelper  = require('./developer_data_helper'),
    CodeMaatHelper       = require('./code_maat_helper'),
    ReportHelper         = require('./report_helper');

module.exports = function(context) {
  return {
    graphData:      new GraphDataHelper(context),
    revisionStream: new RevisionStreamHelper(context),
    developerData:  new DeveloperDataHelper(context),
    files:          new FilesHelper(context),
    report:         new ReportHelper(context),
    codeMaat:       new CodeMaatHelper(context)
  };
};
