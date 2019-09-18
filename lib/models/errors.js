/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var errorFunction = function(errorName) {
  var ErrorFunction = function(msg) {
    var e = Error.call(this, msg);
    this.message = e.message;
    this.stack = e.stack;
  };
  ErrorFunction.prototype = Object.create(Error.prototype);
  ErrorFunction.prototype.name = errorName;

  return ErrorFunction;
};
// var CFValidationError = function(msg) {
//   var e = Error.call(this, msg);
//   this.message = e.message;
//   this.stack = e.stack;
// };

// CFValidationError.prototype = Object.create(Error.prototype);
// CFValidationError.prototype.name = 'CFValidationError';

module.exports = {
  CFValidationError: errorFunction('CFValidationError'),
  CFRuntimeError: errorFunction('CFRuntimeError')
};
