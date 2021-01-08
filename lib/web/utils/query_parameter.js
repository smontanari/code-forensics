/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var QueryParameter = function() { this.values = []; };

QueryParameter.prototype.addValue = function(v) { this.values.push(decodeURIComponent(v)); };
QueryParameter.prototype.getValue = function() { return this.values[0]; };
QueryParameter.prototype.getValues = function() { return this.values; };

QueryParameter.fromRequestUrl = function() {
  var queryString = document.location.search.substr(1);
  return _.reduce(queryString.split('&'), function(urlParameters, paramString) {
    var nameValuePair = paramString.split('=');
    var paramName = nameValuePair[0];
    if (_.isUndefined(urlParameters[paramName])) {
      urlParameters[paramName] = new QueryParameter();
    }
    urlParameters[paramName].addValue(nameValuePair[1]);
    return urlParameters;
  }, {});
};

module.exports = QueryParameter;
