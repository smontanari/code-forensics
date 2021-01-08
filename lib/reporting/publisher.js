/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    Path      = require('path'),
    mkdirp    = require('mkdirp'),
    sha1      = require('sha1'),
    ansi      = require('ansi-colors'),
    Bluebird  = require('bluebird'),
    utils     = require('../utils'),
    logger    = require('../log'),
    appConfig = require('../runtime/app_config');

module.exports = function(task, context) {
  var currentTime = new Date().toISOString();
  var filesData = [];
  var enabledDiagrams = [];
  var reportDir;

  var reportId = sha1(task.name + currentTime);

  var createReportDir = function() {
    if (_.isUndefined(reportDir)) {
      reportDir = Path.join(context.outputDir, reportId);
      mkdirp.sync(reportDir);
    }
  };

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
    createReportDir();
    return Path.join(reportDir, datedFilename);
  };

  var validation = function() {
    if (_.isEmpty(filesData)) {
      throw new Error('Failed to create report: no available data files');
    } else if (_.isEmpty(enabledDiagrams)) {
      throw new Error('Failed to create report: no diagrams enabled');
    }
  };

  this.addReportFileForType = function(fileType, timePeriod) {
    return addFile(fileType, timePeriod);
  };

  this.addReportFile = function(timePeriod) {
    return addFile(undefined, timePeriod);
  };

  this.enableDiagram = function(name) {
    enabledDiagrams.push(name);
  };

  this.createManifest = function() {
    return Bluebird.try(validation)
      .then(function() {
        createReportDir();
        return utils.json.objectToFile(Path.join(reportDir, 'manifest.json'), {
          id: reportId,
          reportName: task.reportName || task.name,
          taskName: task.name,
          time: currentTime,
          dateRange: context.dateRange.toString(),
          parameters: _.pick(context.parameters, _.pull(_.map(task.parameters, 'name'), 'dateFrom', 'dateTo')),
          enabledDiagrams: enabledDiagrams,
          dataFiles: _.sortBy(filesData, 'timePeriod')
        }).then(function() {
          logger.log('Open the following link to see the results:');
          logger.log(ansi.blue('http://localhost:' + appConfig.get('serverPort') + '/index.html?reportId=' + reportId));
          return reportId;
        });
      });
  };
};
