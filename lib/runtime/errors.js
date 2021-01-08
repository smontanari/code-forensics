/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var appConfig = require('./app_config');

var errorFunction = function(errorName) {
  var ErrorFunction = function(msg) {
    var e = Error.call(this, msg);
    this.message = e.message;
    this.stack = e.stack;
    this.showStack = appConfig.get('debugMode');
  };
  ErrorFunction.prototype = Object.create(Error.prototype);
  ErrorFunction.prototype.name = errorName;

  return ErrorFunction;
};

module.exports = {
  CFValidationError: errorFunction('CFValidationError'),
  CFRuntimeError: errorFunction('CFRuntimeError')
};
