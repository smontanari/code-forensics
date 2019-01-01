/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

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
