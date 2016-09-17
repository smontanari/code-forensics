var _         = require('lodash'),
    Path      = require('path'),
    mkdirp    = require('mkdirp'),
    sha1      = require('sha1'),
    chalk     = require('chalk'),
    utils     = require('../utils'),
    appConfig = require('../runtime/app_config');

var REPORT_FILES = {
  'hotspot-analysis':    'revisions-hotspot-data.json',
  'sum-of-coupling':     'sum-of-coupling-data.json',
  'complexity-trend':    'complexity-trend-data.json',
  'temporal-coupling':   'temporal-coupling-data.json',
  'commit-word-cloud':   'word-cloud-data.json',
  'authors-coupling':    'authors-coupling-data.json',
  'system-evolution': {
    'coupling-trend': 'system-coupling-data.json',
    'revisions-trend': 'system-revisions-data.json'
  }
};

module.exports = function(reportType, context) {
  if (!REPORT_FILES[reportType]) {
    throw new Error('Invalid report type: ' + reportType);
  }

  var currentTime = new Date().toISOString();
  var filesData = [];

  var reportId = sha1(reportType + currentTime);
  mkdirp(Path.join(context.outputDir, reportId));

  var addFile = function(fileType, timePeriod) {
    var filename = fileType ? REPORT_FILES[reportType][fileType] : REPORT_FILES[reportType];
    var period = (timePeriod || context.dateRange).toString();
    var datedFilename = period + '_' + filename;
    filesData.push({
      fileType: fileType,
      timePeriod: period,
      fileUrl: reportId + '/' + datedFilename
    });
    utils.log(chalk.yellow("Adding report file ") + chalk.grey('[' + reportType + ', ' + period +  ', ' + filename + ']'));
    return Path.join(context.outputDir, reportId, datedFilename);
  };

  this.addReportFileForType = function(fileType, timePeriod) {
    return addFile(fileType, timePeriod);
  };

  this.addReportFile = function(timePeriod) {
    return addFile(undefined, timePeriod);
  };

  this.createManifest = function() {
    utils.json.objectToFile(Path.join(context.outputDir, reportId, 'manifest.json'), {
      id: reportId,
      reportType: reportType,
      time: currentTime,
      dateRange: context.dateRange.toString(),
      targetFile: context.targetFile,
      boundary: context.parameters.boundary,
      frequency: context.parameters.frequency,
      maxCoupledFiles: context.parameters.maxCoupledFiles,
      dataFiles: _.sortBy(filesData, 'timePeriod')
    });
    utils.messages.logReportUrl(appConfig.get('serverPort'), reportId);
  };
};
