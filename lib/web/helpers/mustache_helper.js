var mustache = require('mustache');

var asyncLoader = require('../utils/async_loader.js');

var parsedTemplates = {};

module.exports = {
  renderTemplate: function(id, data) {
    return mustache.render(parsedTemplates[id], data);
  },
  addTemplate: function(id, file) {
    var self = this;
    return asyncLoader.loadHtmlTemplate(id, file).then(function() {
      var template = document.getElementById(id).textContent;
      mustache.parse(template);
      parsedTemplates[id] = template;
    });
  }
};
