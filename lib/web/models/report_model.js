var _ = require('lodash');

var GraphModel    = require('./graph_model.js'),
    ManifestMixin = require('./manifest_mixin.js'),
    reportTypes   = require('../report_types/index.js');

var ReportModel = function(configuration) {
  this.metadata = configuration.metadata;
  this.graphModels = _.map(configuration.graphModels, GraphModel.create);
  this.hasMultipleGraphs = this.graphModels.length > 1;
};

ReportModel.create = function(manifest) {
  var reportConfiguration = reportTypes[manifest.reportType](_.mixin(manifest, ManifestMixin));
  return new ReportModel(reportConfiguration);
};

module.exports = ReportModel;
