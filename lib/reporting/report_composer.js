/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    Bluebird          = require('bluebird'),
    DataSourceHandler = require('./data_source_handler');

var ReportComposer = function(initialDataSource) {
  var dataSourceHandler = DataSourceHandler.instance();
  var dataSources = [];

  var mergeAllReports = function(reportData) {
    return Bluebird.map(dataSources, function(ds) {
      return dataSourceHandler.processDataSource(ds.source).then(function(data) {
        _.each(reportData, function(reportItem) {
          _.each(_.filter(data, _.partial(ds.mergeOptions.matchStrategy, reportItem)), function(dataItem) {
            return ds.mergeOptions.mergeStrategy(reportItem, dataItem);
          });
        });
      });
    });
  };

  this.mergeWith = function() {
    dataSources.push(ReportComposer.newDataSource.apply(null, arguments));
    return this;
  };

  this.mergeAll = function(sources) {
    dataSources = dataSources.concat(sources);
    return this;
  };

  this.buildReport = function() {
    return dataSourceHandler.processDataSource(initialDataSource).then(function(reportData) {
      return mergeAllReports(reportData).then(function() {
        return reportData;
      });
    });
  };
};

ReportComposer.newDataSource = function(source, mergeOptions) {
  return { source: source, mergeOptions: mergeOptions };
};

module.exports = ReportComposer;
