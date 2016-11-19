var _  = require('lodash'),
    Q  = require('q'),
    ko = require('knockout');

var asyncLoader       = require('../utils/async_loader.js'),
    mustacheHelper    = require('../helpers/mustache_helper.js'),
    GraphControlGroup = require('./graph_control_group.js'),
    Diagram           = require('../diagrams/diagram.js');

var GraphModel = function(graphModelConfig) {
  var self = this;
  this.id = graphModelConfig.id;
  this.label = graphModelConfig.label;
  this.isSelected = ko.observable(false);
  this.graphControlGroups = [
    new GraphControlGroup('filters', 'Filters'),
    new GraphControlGroup('widgets')
  ];

  _.each(graphModelConfig.controlTemplates, function(templates, groupName) {
    var group = _.find(self.graphControlGroups, { 'name': groupName });
    _.each(templates, group.addTemplate.bind(group));
  });

  var viewTemplatePromises = function() {
    return _.map(graphModelConfig.viewTemplates, function(t) {
      return mustacheHelper.loadTemplate(t.id, t.file);
    });
  };

  var controlTemplatePromises = function() {
    return _.map(self.graphControlGroups, _.method('loadAllTemplates'));
  };

  this.diagram = new Diagram(graphModelConfig.id, graphModelConfig.diagram);

  this.initialize = function() {
    return Q.all(
      controlTemplatePromises()
        .concat(viewTemplatePromises())
        .concat(
          asyncLoader.loadData(graphModelConfig.dataFile)
          .then(this.diagram.onData.bind(this.diagram))
        )
    );
  };
};

GraphModel.create = function(graphModelConfig) {
  return new GraphModel(graphModelConfig);
};

module.exports = GraphModel;
