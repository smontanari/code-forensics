var Path      = require('path'),
    _         = require('lodash'),
    models    = require('../models'),
    appConfig = require('./app_config');

module.exports = {
  TaskContext: function(configuration, parameters) {
    this.tempDir = configuration.tempDir ? Path.resolve(configuration.tempDir) : Path.join(appConfig.get('basedir'), 'tmp');
    this.outputDir = configuration.outputDir ? Path.resolve(configuration.outputDir) : Path.join(appConfig.get('basedir'), 'output');

    this.repository = new models.Repository(configuration.repository);

    this.timePeriods = new models.TimeIntervalBuilder(configuration.dateFormat)
    .from(parameters.dateFrom)
    .to(parameters.dateTo)
    .split(parameters.frequency)
    .build();

    this.dateRange = new models.TimePeriod(
      _.first(this.timePeriods).startDate,
      _.last(this.timePeriods).endDate
    );

    this.boundaries = (configuration.architecturalBoundaries || {})[parameters.boundary];
    this.developerInfo = new models.DeveloperInfo(configuration.teamsComposition);

    this.parameters = parameters;

    var self = this;
    _.each([
      'dateFormat',
      'commitCloudFilters',
      'languages'
    ], function(prop) {
      self[prop] = configuration[prop];
    });
  }
};
