/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout'),
    _  = require('lodash');

var asyncLoader     = require('../utils/async_loader.js'),
    localeDetection = require('../utils/locale_detection.js'),
    ManifestMixin   = require('./manifest_mixin.js');

var ReportInfoModel = function(manifest) {
  this.reportName = manifest.reportName;
  this.reportUrl = manifest.getReportUrl();
  this.time = new Date(manifest.time).toLocaleString(localeDetection(), { hour12: false });

  this.parameters = _.concat(
    [{ name: 'time period', value: manifest.dateRange.split('_').join(' - ') }],
    _.map(manifest.parameters, function(value, key) {
      return { name: key, value: value };
    })
  );
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
