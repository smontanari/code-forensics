var _       = require('lodash'),
    Router  = require('router'),
    handler = require('./handler');

module.exports = {
  newRouter: function(dataPath) {
    return _.tap(Router(), function(router) {
      handler(router, dataPath);
    });
  }
};
