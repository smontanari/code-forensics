/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var ko = require('knockout');

var ViewModel      = require('./view_model.js'),
    QueryParameter = require('./utils/query_parameter.js');

module.exports.run = function() {
  window.viewModel = new ViewModel(QueryParameter.fromRequestUrl()); //for debugging purposes
  ko.applyBindings(window.viewModel);
};
