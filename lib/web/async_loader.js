var CodeForensics = (function(module) {

  module.asyncLoader = {
    loadHtmlTemplate: function(id, file) {
      if (window.document.getElementById(id) === null) {
        return window.fetch('templates/' + file)
        .then(function(response) {
          return response.text();
        })
        .then(function(html) {
          if (window.document.getElementById(id) === null) {
            window.document.getElementById('templates').insertAdjacentHTML('beforeend', html);
          }
        });
      }
    },
    loadData: function(file) {
      return window.fetch('data/' + file).then(function(response) {
        return response.json();
      });
    }
  };

  return module;
})(CodeForensics || {});
