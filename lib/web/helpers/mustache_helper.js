var mustache = require('mustache'),
    Q        = require('q');

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
  loadTemplate: function(id, file) {
    if (parsedTemplates[id]) { return Q(); }

    return asyncLoader.loadTemplate(file).then(function(content) {
      if (parsedTemplates[id]) { return; }

      parsedTemplates[id] = parseTemplate(id, content);
    });
  }
};
