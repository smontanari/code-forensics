var d3 = require('d3');

var TYPE = {
  default: _.identity,
  zeroBased: function(dataArray) {
    return [0, d3.max(dataArray)];
  },
  extentBased: function(dataArray) {
    return d3.extent(dataArray);
  }
};

module.exports = function(data, type) {
  if (_.isFunction(type)) { return type(data); }
  return TYPE[type || 'default'](data);
};
