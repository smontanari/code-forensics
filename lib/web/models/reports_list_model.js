var ko = require('knockout'),
    _  = require('lodash');

var asyncLoader   = require('../utils/async_loader.js'),
    ManifestMixin = require('./manifest_mixin.js');

var ReportInfoModel = function(manifest) {
  this.reportType = manifest.reportType;
  this.reportUrl = manifest.getReportUrl();
  this.time = new Date(manifest.time).toLocaleString(undefined, { hour12: false });
  this.parameters = _.filter([
    { name: 'dateRange', value: manifest.dateRange.split('_').join(' - ') },
    { name: 'targetFile', value: manifest.targetFile },
    { name: 'boundary', value: manifest.boundary },
    { name: 'maxCoupledFiles', value: manifest.maxCoupledFiles },
    { name: 'frequency', value: manifest.frequency }
  ], function(p) { return p.value !== undefined; });
};

module.exports = function() {
  var self = this;
  this.reportsInfo = ko.observable([]);

  asyncLoader.loadJSON('/allReports').then(function(reportsManifests) {
    self.reportsInfo(_.map(_.reverse(_.sortBy(reportsManifests, 'time')), function(manifest) {
      return new ReportInfoModel(_.mixin(manifest, ManifestMixin));
    }));
  });
};
