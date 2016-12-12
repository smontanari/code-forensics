var Path      = require('path'),
    _         = require('lodash'),
    models    = require('../models'),
    appConfig = require('./app_config');

var PARAMETERS_DEFAULTS = {
  maxCoupledFiles: 5,
  minWordCount: 5
};

var CONFIGURATION_DEFAULTS = {
  dateFormat: 'YYYY-MM-DD',
  languages: ['javascript']
};

module.exports = function(config, params) {
  var configuration = _.defaults({}, config, CONFIGURATION_DEFAULTS);

  this.parameters = _.defaults({}, params, PARAMETERS_DEFAULTS);
  this.tempDir = configuration.tempDir ? Path.resolve(configuration.tempDir) : Path.join(appConfig.get('basedir'), 'tmp');
  this.outputDir = configuration.outputDir ? Path.resolve(configuration.outputDir) : Path.join(appConfig.get('basedir'), 'output');

  this.repository = new models.Repository(configuration.repository);

  this.timePeriods = new models.TimeIntervalBuilder(configuration.dateFormat)
    .from(this.parameters.dateFrom)
    .to(this.parameters.dateTo)
    .split(this.parameters.frequency)
    .build();

  this.dateRange = new models.TimePeriod(
    _.first(this.timePeriods).startDate,
    _.last(this.timePeriods).endDate
  );

  this.boundaries = (configuration.architecturalBoundaries || {})[this.parameters.boundary];
  this.developerInfo = new models.DeveloperInfo(configuration.teamsComposition);

  this.languages = _.map(configuration.languages, function(lang) {
    if (_.isUndefined(models.LanguageDefinitions.getDefinition(lang))) {
      throw new models.CFValidationError('Language "' + lang + '" is not supported');
    }
    return lang;
  });

  this.commitMessagesFilters = configuration.commitMessagesFilters;
};
