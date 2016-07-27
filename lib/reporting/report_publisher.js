var mkdirp    = require('mkdirp'),
    sha1      = require('sha1'),
    chalk     = require('chalk'),
    utils     = require('../utils'),
    appConfig = require('../runtime/app_config');

var REPORT_FILES = {
  'hotspot-analysis-report':  'revisions-hotspot-data.json',
  'sum-of-coupling-report':   'sum-of-coupling-data.json',
  'complexity-trend-report':  'complexity-trend-data.json',
  'temporal-coupling-report': 'temporal-coupling-data.json'
};

module.exports = function(reportType, context) {
  if (!REPORT_FILES[reportType]) {
    throw new Error('Invalid report type: ' + reportType);
  }

  var currentTime = new Date().toISOString();
  var filesData = [];

  var reportId = sha1(reportType + currentTime)
  mkdirp(context.files.output.reportFolder(reportId));

  this.addReportFile = function(timePeriod) {
    var period = (timePeriod || context.dateRange).toString();
    var datedFilename = period + '_' + REPORT_FILES[reportType];
    filesData.push({
      timePeriod: period,
      filename: datedFilename
    });
    utils.log(chalk.yellow("Adding report file ") + chalk.grey('[' + reportType + ', ' + period + ']'));
    return context.files.output.reportFile(reportId, datedFilename);
  };

  this.createManifest = function() {
    utils.json.objectToFile(context.files.output.reportFile(reportId, 'manifest.json'), {
      id: reportId,
      reportType: reportType,
      time: currentTime,
      dateRange: context.dateRange.toString(),
      targetFile: context.targetFile,
      boundary: context.boundary,
      dataFiles: filesData
    });
    utils.messages.logReportUrl(appConfig.serverPort, reportId);
  };
};
