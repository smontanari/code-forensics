var Path      = require('path'),
    _         = require('lodash'),
    models    = require('../models'),
    appConfig = require('./app_config');

var PARAMETERS_DEFAULTS = {
  maxCoupledFiles: 5
};

module.exports = function(configuration, parameters) {
  this.tempDir = configuration.tempDir ? Path.resolve(configuration.tempDir) : Path.join(appConfig.get('basedir'), 'tmp');
  this.outputDir = configuration.outputDir ? Path.resolve(configuration.outputDir) : Path.join(appConfig.get('basedir'), 'output');

  this.repository = new models.Repository(configuration.repository);

  this.dateFormat = configuration.dateFormat || 'YYYY-MM-DD';
  this.timePeriods = new models.TimeIntervalBuilder(this.dateFormat)
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

  this.parameters = _.defaults({}, parameters, PARAMETERS_DEFAULTS);

  var self = this;
  _.each([
    'commitCloudFilters',
    'languages'
  ], function(prop) {
    self[prop] = configuration[prop];
  });
};
