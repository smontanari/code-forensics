var _                 = require('lodash'),
    fs                = require('fs'),
    isStream          = require('is-stream'),
    Q                 = require('q'),
    utils             = require('../utils'),
    objectTransformer = require('./object_transformer');

var ReportComposer = function(initialDataSource) {
  var dataSources = [];

  var processDataSource = function(source) {
    if (_.isArray(source)) {
      return Q(source);
    } else if (isStream.readable(source)) {
      return utils.stream.streamToArray(source);
    } else if (utils.fileSystem.isFile(source)) {
      return utils.json.fileToObject(source);
    } else {
      return Q.reject(new Error('Invalid report source data: ' + source));
    }
  };

  var mergeAllReports = function(reportData) {
    return _.map(dataSources, function(ds) {
      return processDataSource(ds.source).then(function(data) {
        _.each(data, function(dataItem) {
          var reportItem = _.find(reportData, _.partial(ds.matchFn, dataItem));
          if (reportItem) {
            _.extend(reportItem, objectTransformer.apply(dataItem, ds.transformOption));
          }
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
    return processDataSource(initialDataSource).then(function(reportData) {
      return Q.all(mergeAllReports(reportData)).then(function() {
        return reportData;
      });
    });
  };
};

ReportComposer.newDataSource = function(source, matchFn, transformOption) {
  return { source: source, matchFn: matchFn, transformOption: transformOption };
};

module.exports = ReportComposer;
