var CodeForensics = (function(module) {
  module.QueryParameter = function() { this.values = []; };
  module.QueryParameter.prototype.addValue = function(v) { this.values.push(decodeURIComponent(v)); };
  module.QueryParameter.prototype.getValue = function() { return this.values[0]; };
  module.QueryParameter.prototype.getValues = function() { return this.values; };

  module.QueryParameter.fromRequestUrl = function() {
    var queryString = document.location.search.substr(1);
    return _.reduce(queryString.split('&'), function(urlParameters, paramString) {
      var nameValuePair = paramString.split('=');
      var paramName = nameValuePair[0];
      if (_.isUndefined(urlParameters[paramName])) {
        urlParameters[paramName] = new module.QueryParameter();
      }
      urlParameters[paramName].addValue(nameValuePair[1]);
      return urlParameters;
    }, {});
  };

  return module;
})(CodeForensics || {});
