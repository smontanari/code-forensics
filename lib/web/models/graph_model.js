var _  = require('lodash'),
    Q  = require('q'),
    ko = require('knockout');

var asyncLoader = require('../utils/async_loader.js')
    diagrams    = require('../diagrams/index.js');

var dasherize = function(s) {
  return s.replace(/[A-Z]/g, function(c, index) {
    return (index !== 0 ? '-' : '') + c.toLowerCase();
  });
};

var GraphModel = function(graphConfig) {
  var self = this;
  this.id = graphConfig.id;
  this.label = graphConfig.label;
  this.diagramType = dasherize(graphConfig.diagramType);
  this.isSelected = ko.observable(false);
  this.controlsTemplateId = ko.observable(null);
  this.diagram = diagrams[graphConfig.diagramType].create(_.omit(graphConfig, 'label', 'dataFile', 'controlsTemplate', 'transformData'));

  this.initialize = function() {
    return Q.all([
      asyncLoader.loadData(graphConfig.dataFile).then(function(series) {
        self.diagram.onData((graphConfig.transformData || _.identity).call(null, series));
      }),
      asyncLoader.loadHtmlTemplate(graphConfig.controlsTemplate.id, graphConfig.controlsTemplate.file)
      .then(function() {
        self.controlsTemplateId(graphConfig.controlsTemplate.id);
      })
    ]);
  };
};

GraphModel.create = function(config) {
  return new GraphModel(config);
};

module.exports = GraphModel;
