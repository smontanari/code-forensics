var _         = require('lodash'),
    Path      = require('path'),
    mkdirp    = require('mkdirp'),
    sha1      = require('sha1'),
    chalk     = require('chalk'),
    utils     = require('../utils'),
    logger    = require('../log').Logger,
    appConfig = require('../runtime/app_config');

var ANALYSIS_REPORTS = {
  'hotspot-analysis':  { file: 'revisions-hotspot-data.json' },
  'sum-of-coupling':   { file: 'sum-of-coupling-data.json' },
  'complexity-trend':  { file: 'complexity-trend-data.json', parameters: 'targetFile' },
  'temporal-coupling': { file: 'temporal-coupling-data.json', parameters: ['targetFile', 'frequency'] },
  'commit-messages':   { file: 'commit-words-data.json', parameters: 'frequency' },
  'authors-coupling':  { file: 'authors-coupling-data.json', parameters: 'maxCoupledFiles' },
  'developer-effort':  {
    file: {
      'individual-effort': 'developer-effort-data.json',
      'team-effort':       'team-effort-data.json',
    }
  },
  'system-evolution':  {
    file: {
      'coupling-trend': 'system-coupling-data.json',
      'revisions-trend': 'system-revisions-data.json'
    },
    parameters: ['frequency', 'boundary']
  }
};

module.exports = function(reportType, context) {
  if (!ANALYSIS_REPORTS[reportType]) {
    throw new Error('Invalid report type: ' + reportType);
  }

  var currentTime = new Date().toISOString();
  var filesData = [];

  var reportId = sha1(reportType + currentTime);
  mkdirp(Path.join(context.outputDir, reportId));

  var addFile = function(fileType, timePeriod) {
    var filename = fileType ? ANALYSIS_REPORTS[reportType].file[fileType] : ANALYSIS_REPORTS[reportType].file;
    var period = (timePeriod || context.dateRange).toString();
    var datedFilename = period + '_' + filename;
    filesData.push({
      fileType: fileType,
      timePeriod: period,
      fileUrl: reportId + '/' + datedFilename
    });
    logger.info('Adding report file ', '[' + reportType + ', ' + period +  ', ' + filename + ']');
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
      reportType: reportType,
      time: currentTime,
      dateRange: context.dateRange.toString(),
      parameters: _.pick(context.parameters, ANALYSIS_REPORTS[reportType].parameters),
      dataFiles: _.sortBy(filesData, 'timePeriod')
    }).then(function() {
      logger.log('Open the following link to see the results:');
      logger.log(chalk.blue('http://localhost:' + appConfig.get('serverPort') + '/index.html?reportId=' + reportId));
    });
  };
};
