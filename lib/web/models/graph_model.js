/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Bluebird = require('bluebird'),
    ko       = require('knockout');

var asyncLoader       = require('../utils/async_loader.js'),
    mustacheHelper    = require('../helpers/mustache_helper.js'),
    GraphControlGroup = require('./graph_control_group.js'),
    Diagram           = require('../diagrams/diagram.js'),
    templateRegister  = require('./template_register.js');

var GraphModel = function(graphModelConfig) {
  var self = this;
  this.id = graphModelConfig.id;
  this.label = graphModelConfig.label;
  this.hasDataFile = _.isObject(graphModelConfig.dataFile);
  this.isSelected = ko.observable(false);
  this.graphControlGroups = {
    filters: new GraphControlGroup(),
    widgets: new GraphControlGroup()
  };

  var templateData = { widgets: {}, filters: {} };

  _.each(graphModelConfig.controlTemplates, function(templates, groupName) {
    var group = self.graphControlGroups[groupName];
    _.each(templates, function(tmpl) {
      var templateProperties = templateRegister[tmpl.name];
      group.addTemplate(templateProperties, tmpl.data);
      templateData[groupName][templateProperties.id] = tmpl.data;
    });
  });

  var viewTemplatePromises = function() {
    return _.map(graphModelConfig.viewTemplates, function(tmplName) {
      return mustacheHelper.loadTemplate(templateRegister[tmplName]);
    });
  };

  var controlTemplatePromises = function() {
    return _.map(_.values(self.graphControlGroups), _.method('loadAllTemplates'));
  };

  this.filtersData = function(templateId, propertyPath) {
    return _.at(templateData.filters[templateId], propertyPath);
  };

  this.widgetsData = function(templateId, propertyPath) {
    return _.at(templateData.widgets[templateId], propertyPath);
  };

  this.diagram = new Diagram(graphModelConfig.id, graphModelConfig.diagram);

  this.initialize = function() {
    return Bluebird.all(
      controlTemplatePromises()
        .concat(viewTemplatePromises())
        .concat(
          asyncLoader.loadData(graphModelConfig.dataFile.fileUrl)
          .then(this.diagram.onData.bind(this.diagram))
        )
    );
  };

  this.isSelected.subscribe(function(selected) {
    if (selected) {
      self.diagram.activate();
    } else {
      self.diagram.deactivate();
    }
  });
};

GraphModel.create = function(graphModelConfig) {
  return new GraphModel(graphModelConfig);
};

module.exports = GraphModel;
