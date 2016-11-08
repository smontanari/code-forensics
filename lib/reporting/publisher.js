var _         = require('lodash'),
    Path      = require('path'),
    mkdirp    = require('mkdirp'),
    sha1      = require('sha1'),
    chalk     = require('chalk'),
    utils     = require('../utils'),
    logger    = require('../log').Logger,
    appConfig = require('../runtime/app_config');

module.exports = function(task, context) {
  var currentTime = new Date().toISOString();
  var filesData = [];

  var reportId = sha1(task.name + currentTime);
  mkdirp(Path.join(context.outputDir, reportId));

  var resolveReportFile = function(fileType) {
    if (fileType) {
      if (task.reportFiles && task.reportFiles[fileType]) {
        return task.reportFiles[fileType];
      }
      throw new Error('Invalid report file type: ' + fileType);
    } else {
      if (task.reportFile) {
        return task.reportFile;
      }
      throw new Error('Missing report file information');
    }
  };

  var addFile = function(fileType, timePeriod) {
    var filename = resolveReportFile(fileType);
    var period = (timePeriod || context.dateRange).toString();
    var datedFilename = period + '_' + filename;
    filesData.push({
      fileType: fileType,
      timePeriod: period,
      fileUrl: reportId + '/' + datedFilename
    });
    logger.info('Generating report file ', datedFilename);
    return Path.join(context.outputDir, reportId, datedFilename);
  };

  this.addReportFileForType = function(fileType, timePeriod) {
    return addFile(fileType, timePeriod);
  };

  this.addReportFile = function(timePeriod) {
    return addFile(undefined, timePeriod);
  };

  this.createManifest = function() {
    return utils.json.objectToFile(Path.join(context.outputDir, reportId, 'manifest.json'), {
      id: reportId,
      reportName: task.reportName || task.name,
      taskName: task.name,
      time: currentTime,
      dateRange: context.dateRange.toString(),
      parameters: _.pick(context.parameters, _.pull(_.map(task.parameters, 'name'), 'dateFrom', 'dateTo')),
      dataFiles: _.sortBy(filesData, 'timePeriod')
    }).then(function() {
      logger.log('Open the following link to see the results:');
      logger.log(chalk.blue('http://localhost:' + appConfig.get('serverPort') + '/index.html?reportId=' + reportId));
    });
  };
};
