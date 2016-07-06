var ko = require('knockout'),
    _ = require('lodash');

module.exports = function(label, objProperty) {
  var self = this;
  this.label = label;

  this.inputValue = ko.observable('');

  this.outputValue = ko.pureComputed(function() {
    try {
      return new RegExp(self.inputValue());
    } catch(e) {
      return self.inputValue();
    }
  });

  this.applyToObject = function(obj) {
    if (_.isRegExp(self.outputValue())) {
      return self.outputValue().test(obj[objProperty]);
    }
    return obj.includes(self.outputValue());
  };
};
