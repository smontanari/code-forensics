/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path   = require('path'),
    _      = require('lodash'),
    models = require('../models');

var PARAMETERS_DEFAULTS = {
  maxCoupledFiles: 5,
  minWordCount: 5
};

var CONFIGURATION_DEFAULTS = {
  tempDir: 'tmp',
  outputDir: 'output',
  dateFormat: 'YYYY-MM-DD',
  languages: ['javascript']
};

module.exports = function(config, params) {
  var configuration = _.defaults({}, config, CONFIGURATION_DEFAULTS);

  this.parameters = _.defaults({}, params, PARAMETERS_DEFAULTS);
  this.tempDir = Path.resolve(configuration.tempDir);
  this.outputDir = Path.resolve(configuration.outputDir);

  this.repository = new models.Repository(configuration.repository);

  this.timePeriods = new models.TimeIntervalBuilder(configuration.dateFormat)
    .from(this.parameters.dateFrom)
    .to(this.parameters.dateTo)
    .split(this.parameters.timeSplit)
    .build();

  this.dateRange = new models.TimePeriod(
    { start: _.first(this.timePeriods).startDate, end: _.last(this.timePeriods).endDate },
    configuration.dateFormat
  );

  this.boundaries = (configuration.architecturalBoundaries || {})[this.parameters.boundary];
  this.developerInfo = new models.DeveloperInfo(configuration.contributors);

  this.languages = _.map(configuration.languages, function(lang) {
    if (_.isUndefined(models.LanguageDefinitions.getDefinition(lang))) {
      throw new models.CFValidationError('Language "' + lang + '" is not supported');
    }
    return lang;
  });

  this.commitMessageFilters = configuration.commitMessageFilters;
};
