/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path   = require('path'),
    _      = require('lodash'),
    logger = require('../log'),
    models = require('../models');

var runtimeDefaults = require('./defaults');

module.exports = function(config, params) {
  var configuration = _.defaults({}, config, runtimeDefaults.configuration);

  this.parameters = _.defaults({}, params, runtimeDefaults.parameters);
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

  this.layerGrouping = new models.LayerGrouping((configuration.layerGroups || {})[this.parameters.layerGroup]);
  this.developersInfo = new models.DevelopersInfo(configuration.contributors);

  this.languages = _.filter(configuration.languages, function(lang) {
    if (_.isUndefined(models.LanguageDefinitions.getDefinition(lang))) {
      logger.warn('Language "' + lang + '" is not supported');
      return false;
    }
    return true;
  });

  this.commitMessageFilters = configuration.commitMessageFilters;
};
