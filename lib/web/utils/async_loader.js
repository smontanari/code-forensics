/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Bluebird = require('bluebird');

var templateExists = function(id) {
  return window.document.getElementById(id) !== null;
};

module.exports = {
  loadTemplate: function(file) {
    return window.fetch('/templates/' + file)
    .then(function(response) { return response.text(); });
  },
  loadTemplateIntoDocument: function(id, file) {
    if (templateExists(id)) { return Bluebird.resolve(); }

    return this.loadTemplate(file).then(function(content) {
      if (!templateExists(id)) {
        window.document.getElementById('templates').insertAdjacentHTML('beforeend', content);
      }
    });
  },
  loadJSON: function(requestUrl) {
    return window.fetch(requestUrl).then(function(response) {
      return response.json();
    });
  },
  loadData: function(file) {
    return this.loadJSON('/data/' + file);
  }
};
