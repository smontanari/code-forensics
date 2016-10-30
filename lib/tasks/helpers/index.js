var GraphDataHelper     = require('./graph_data_helper'),
    RevisionHelper      = require('./revision_helper'),
    FilesHelper         = require('./files_helper'),
    DeveloperDataHelper = require('./developer_data_helper');

module.exports = function(context) {
  return {
    graphData:     new GraphDataHelper(context),
    revision:      new RevisionHelper(context),
    developerData: new DeveloperDataHelper(context),
    files:         new FilesHelper(context)
  };
};
