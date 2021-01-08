/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Bluebird = require('bluebird'),
    ko       = require('knockout');

var asyncLoader = require('../utils/async_loader.js');

module.exports = function() {
  var self = this;
  var templates = [];
  this.templateIds = ko.observable();

  this.addTemplate = function(templateProperties, templateData) {
    templates.push({ properties: templateProperties, data: templateData });
  };

  this.hasTemplates = function() {
    return templates.length > 0;
  };

  this.loadAllTemplates = function() {
    return Bluebird.all(_.map(templates, function(tmpl) {
      return asyncLoader.loadTemplateIntoDocument(tmpl.properties.id, tmpl.properties.file);
    })).then(function() {
      self.templateIds(_.map(templates, 'properties.id'));
    });
  };
};
