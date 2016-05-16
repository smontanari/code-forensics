var ko = require('knockout');

var ViewModel      = require('./view_model.js'),
    QueryParameter = require('./utils/query_parameter.js');

module.exports.run = function() {
  window.viewModel = new ViewModel(QueryParameter.fromRequestUrl()); //for debugging purposes
  ko.applyBindings(viewModel);
};
