var Q = require('q');

var templateExists = function(id) {
  return window.document.getElementById(id) !== null;
};

module.exports = {
  loadHtmlTemplate: function(id, file) {
    if (templateExists(id)) {
      return Q();
    }

    return window.fetch('/templates/' + file)
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      if (!templateExists(id)) {
        window.document.getElementById('templates').insertAdjacentHTML('beforeend', html);
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
