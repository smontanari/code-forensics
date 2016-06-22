var Path         = require('path'),
    _            = require('lodash'),
    repository   = require('./repository'),
    taskFiles    = require('./task_files'),
    appConfig    = require('./app_config'),
    timeInterval = require('../time_interval/builder'),
    TimePeriod   = require('../time_interval/time_period');

module.exports = {
  TaskContext: function(configuration, parameters) {
    this.tempDir = configuration.tempDir ? Path.resolve(configuration.tempDir) : Path.join(appConfig.basedir, 'tmp');
    this.outputDir = configuration.outputDir ? Path.resolve(configuration.outputDir) : Path.join(appConfig.basedir, 'output');

    this.repository = new repository.RepositoryConfiguration(configuration.repository);

    this.files = taskFiles(this.tempDir, this.outputDir);

    this.timePeriods = new timeInterval.Builder(configuration.dateFormat)
    .from(parameters.dateFrom)
    .to(parameters.dateTo)
    .split(parameters.frequency)
    .build();

    this.dateRange = new TimePeriod(
      _.first(this.timePeriods).startDate,
      _.last(this.timePeriods).endDate
    );

    this.targetFile = parameters.targetFile || "";

    this.boundary = parameters.boundary;

    this.taskName = parameters.taskName;

    var self = this;
    _.each([
      'dateFormat',
      'architecturalBoundaries',
      'commitCloudFilters',
      'languages'
    ], function(prop) {
      self[prop] = configuration[prop];
    });
  }
};
