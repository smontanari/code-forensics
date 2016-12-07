var _ = require('lodash');

module.exports = function(keyDefinitions, opts) {
  var values = [];
  var options = opts || {};

  this.name = _.map(keyDefinitions, 'name').join(' - ');
  this.keyDefinitions = keyDefinitions;

  this.addValue = function(obj) {
    values.push(obj);
  };

  this.hasAnyKey = function(group, names) {
    var keyDefinition = _.find(keyDefinitions, { 'group': group });
    return _.includes(names, keyDefinition.name);
  };

  this.allValues = function() {
    if (options.sortBy) {
      return _.sortBy(values, options.sortBy);
    }
    return values;
  };
};
