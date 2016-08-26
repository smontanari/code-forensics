var _  = require('lodash'),
    Q  = require('q'),
    ko = require('knockout');

var asyncLoader    = require('../utils/async_loader.js'),
    mustacheHelper = require('../helpers/mustache_helper.js'),
    DiagramFactory = require('../diagrams/diagram_factory.js');

var GraphModel = function(graphModelConfig) {
  var self = this;
  this.id = graphModelConfig.id;
  this.label = graphModelConfig.label;
  this.isSelected = ko.observable(false);
  this.controlsTemplateId = ko.observable(null);

  this.diagram = DiagramFactory.create(graphModelConfig.id, graphModelConfig.diagram);

  var notifyTemplateListeners = function(tmpl) {
    if (tmpl.name === 'controls-template') { self.controlsTemplateId(tmpl.id); }
  };

  var dataLoadPromise = function() {
    return asyncLoader.loadData(graphModelConfig.dataFile).then(self.diagram.onData.bind(self.diagram));
  };

  var templateLoadPromises = function() {
    return _.map(graphModelConfig.templates, function(template) {
      switch(template.type) {
      case 'ko':
        return asyncLoader.loadTemplateIntoDocument(template.id, template.file).then(_.wrap(template, notifyTemplateListeners));
      case 'mustache':
        return mustacheHelper.loadTemplate(template.id, template.file).then(_.wrap(template, notifyTemplateListeners));
      default:
        throw new Error('Invalid template type: ' + template.type);
      };
    });
  };

  this.initialize = function() {
    return Q.all(templateLoadPromises().concat(dataLoadPromise()));
  };
};

GraphModel.create = function(graphModelConfig) {
  return new GraphModel(graphModelConfig);
};

module.exports = GraphModel;
