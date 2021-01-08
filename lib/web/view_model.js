/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout');

var ReportModel      = require('./models/report_model.js'),
    ReportsListModel = require('./models/reports_list_model.js'),
    ReportController = require('./controllers/report_controller.js'),
    asyncLoader      = require('./utils/async_loader.js');

module.exports = function(parameters) {
  var self = this;

  this.reportModel = ko.observable();
  this.reportsListModel = ko.observable();

  if (parameters.reportId) {
    asyncLoader.loadData(parameters.reportId.getValue() + '/manifest.json').then(function(manifest) {
      var model = ReportModel.create(manifest);
      self.reportController = new ReportController(model.graphModels);
      self.reportModel(model);
    });
  } else {
    this.reportsListModel = new ReportsListModel();
  }
};
