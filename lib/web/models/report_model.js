var _ = require('lodash');

var GraphModel    = require('./graph_model.js'),
    ManifestMixin = require('./manifest_mixin.js'),
    reports       = require('../reports/index.js');

var ReportModel = function(configuration) {
  this.metadata = configuration.metadata;
  this.graphModels = _.map(configuration.graphModels, GraphModel.create);
  this.hasMultipleGraphs = this.graphModels.length > 1;
};

ReportModel.create = function(manifest) {
  var reportConfiguration = reports[manifest.reportName](_.mixin(manifest, ManifestMixin));
  return new ReportModel(reportConfiguration);
};

module.exports = ReportModel;
