/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var GraphModel    = require('./graph_model.js'),
    ManifestMixin = require('./manifest_mixin.js'),
    reports       = require('../reports/index.js');

var ReportModel = function(configuration) {
  this.metadata = configuration.metadata;
  this.graphModels = _.filter(
    _.map(configuration.graphModels, GraphModel.create),
    'hasDataFile'
  );

  this.hasMultipleGraphs = this.graphModels.length > 1;
  this.hasGraphs = this.graphModels.length > 0;
};

ReportModel.create = function(manifest) {
  var reportConfiguration = reports[manifest.reportName](_.mixin(manifest, ManifestMixin));
  return new ReportModel(reportConfiguration);
};

module.exports = ReportModel;
