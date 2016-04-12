var _ = require('lodash');

module.exports = {
  arrayToFnFactory: function(array, handler) {
    return array.map(function(item) {
      return _.wrap(item, handler);
    });
  }
};
