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

  this.addTemplate = function(tmpl) {
    templates.push(tmpl);
  };

  this.hasTemplates = function() {
    return templates.length > 0;
  };

  this.loadAllTemplates = function() {
    return Q.all(_.map(templates, function(tmpl) {
      return asyncLoader.loadTemplateIntoDocument(tmpl.id, tmpl.file);
    })).then(function() {
      self.templateIds(_.map(templates, 'id'));
    });
  };
};
