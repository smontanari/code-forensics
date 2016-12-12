var CFValidationError = function(msg) {
  var e = Error.call(this, msg);
  this.message = e.message;
  this.stack = e.stack;
};

CFValidationError.prototype = Object.create(Error.prototype);
CFValidationError.prototype.name = 'CFValidationError';

module.exports = CFValidationError;
