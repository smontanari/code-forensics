var _  = require('lodash'),
    Q  = require('q'),
    ko = require('knockout');

var asyncLoader = require('../utils/async_loader.js'),
    diagrams    = require('../diagrams/index.js');

var dasherize = function(s) {
  return s.replace(/[A-Z]/g, function(c, index) {
    return (index !== 0 ? '-' : '') + c.toLowerCase();
  });
};

var GraphModel = function(config) {
  var self = this;
  this.id = config.id;
  this.label = config.graph.label;
  this.diagramType = dasherize(config.graph.diagramType);
  this.isSelected = ko.observable(false);
  this.controlsTemplateId = ko.observable(null);

  var dataEventsHandler = _.extend({ onLoad: _.identity, onDataModel: _.identity }, config.graph.dataEvents);

  this.diagram = diagrams[config.graph.diagramType].create(config.id, config.diagram, dataEventsHandler);

  var dataLoadPromise = function() {
    return asyncLoader.loadData(config.graph.dataFile).then(self.diagram.onData.bind(self.diagram));
  };

  var templateLoadPromise = function() {
    if (config.graph.controlsTemplate) {
      return asyncLoader.loadHtmlTemplate(config.graph.controlsTemplate.id, config.graph.controlsTemplate.file)
      .then(function() {
        self.controlsTemplateId(config.graph.controlsTemplate.id);
      });
    }
  };

  this.initialize = function() {
    return Q.all([dataLoadPromise(), templateLoadPromise()]);
  };
};

GraphModel.create = function(config) {
  return new GraphModel(config);
};

module.exports = GraphModel;
