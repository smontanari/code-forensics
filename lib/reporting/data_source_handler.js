/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

 var _       = require('lodash'),
    isStream = require('is-stream'),
    Bluebird = require('bluebird'),
    utils    = require('../utils');

var handleSource = function(source) {
  if (_.isArray(source)) {
    return Bluebird.resolve(source);
  } else if (isStream.readable(source)) {
    return utils.stream.objectStreamToArray(source);
  } else if (utils.fileSystem.isFile(source)) {
    return utils.json.fileToObject(source);
  } else {
    return Bluebird.reject(new Error('Invalid report source data: ' + source));
  }
};

var Handler = function() {
  this.processDataSource = function(source) {
    if (_.isFunction(source)) {
      return handleSource(source());
    } else {
      return Bluebird.resolve(source).then(handleSource);
    }
  };
};

module.exports = {
  instance: function() { return new Handler(); }
};
