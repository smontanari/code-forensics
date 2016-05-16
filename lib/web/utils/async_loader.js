var Q = require('q');

var templateExists = function(id) {
  return window.document.getElementById(id) !== null;
};

module.exports = {
  loadHtmlTemplate: function(id, file) {
    if (templateExists(id)) {
      return Q();
    }

    return window.fetch('templates/' + file)
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      if (!templateExists(id)) {
        window.document.getElementById('templates').insertAdjacentHTML('beforeend', html);
      }
    });
  },
  loadData: function(file) {
    return window.fetch('data/' + file).then(function(response) {
      return response.json();
    });
  }
};
