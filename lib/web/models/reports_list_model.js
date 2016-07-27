var ko = require('knockout'),
    _  = require('lodash');

var asyncLoader = require('../utils/async_loader.js');

var ReportInfoModel = function(data) {
  this.reportType = data.reportType;
  this.reportUrl = '?reportId=' + data.id;
  this.time = new Date(data.time).toLocaleString(undefined, { hour12: false });
  this.parameters = _.filter([
    { name: 'dateRange', value: data.dateRange.split('_').join(' - ') },
    { name: 'targetFile', value: data.targetFile }
  ], function(p) { return p.value !== undefined; });
};

module.exports = function() {
  var self = this;
  this.reportsInfo = ko.observable([]);

  asyncLoader.loadJSON('/allReports').then(function(reportsData) {
    self.reportsInfo(_.map(_.reverse(_.sortBy(reportsData, 'time')), function(data) {
      return new ReportInfoModel(data);
    }));
  });
};
