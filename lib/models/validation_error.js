/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var CFValidationError = function(msg) {
  var e = Error.call(this, msg);
  this.message = e.message;
  this.stack = e.stack;
};

CFValidationError.prototype = Object.create(Error.prototype);
CFValidationError.prototype.name = 'CFValidationError';

module.exports = CFValidationError;
