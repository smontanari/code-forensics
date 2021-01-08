/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var mustache = require('mustache'),
    Bluebird = require('bluebird');

var asyncLoader = require('../utils/async_loader.js');

var parsedTemplates = {};
var domParser = new DOMParser();

var parseTemplate = function(id, content) {
  var doc = domParser.parseFromString(content, 'text/html');
  var template = doc.getElementById(id).textContent;
  mustache.parse(template);
  return template;
};

module.exports = {
  renderTemplate: function(id, data) {
    return mustache.render(parsedTemplates[id], data);
  },
  loadTemplate: function(tmpl) {
    if (parsedTemplates[tmpl.id]) { return Bluebird.resolve(); }

    return asyncLoader.loadTemplate(tmpl.file).then(function(content) {
      if (parsedTemplates[tmpl.id]) { return; }

      parsedTemplates[tmpl.id] = parseTemplate(tmpl.id, content);
    });
  }
};
