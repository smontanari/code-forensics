var _  = require('lodash'),
    Q  = require('q'),
    ko = require('knockout');

var asyncLoader = require('../utils/async_loader.js');

module.exports = function(name, heading) {
  var self = this;
  var templates = [];
  this.name = name;
  this.heading = heading;
  this.templateIds = ko.observable();

  this.addTemplate = function(templateProperties, templateData) {
    templates.push({ properties: templateProperties, data: templateData });
  };

  this.hasTemplates = function() {
    return templates.length > 0;
  };

  this.loadAllTemplates = function() {
    return Q.all(_.map(templates, function(tmpl) {
      return asyncLoader.loadTemplateIntoDocument(tmpl.properties.id, tmpl.properties.file);
    })).then(function() {
      self.templateIds(_.map(templates, 'properties.id'));
    });
  };
};
