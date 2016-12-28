var _ = require('lodash');

module.exports = {
  arrayToFnFactory: function(array, handler) {
    return _.map(array, function(item) {
      return _.wrap(item, handler);
    });
  },
  arrayPairsToObject: function(array) {
    var theArray = (array.length % 2) === 0 ? array : _.slice(array, 0, array.length - 1);
    return _.fromPairs(_.chunk(theArray, 2));
  }
};
