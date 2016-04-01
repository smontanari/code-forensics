var _ = require('lodash');

module.exports = {
  apply: function(obj, option) {
    if (_.isFunction(option)) { return option(obj); }
    if (_.isString(option)) {
      return _.tap({}, function(result) {
        result[option] = obj[option];
      });
    }
    return obj;
  }
};
