var _ = require('lodash');

module.exports = function(weightedProperty, normalised) {
  var collection = [];
  var isNormalised = Boolean(normalised);

  var extractWeight = function(item, property) {
    if (_.isFunction(property)) { return property(item); }
    if (_.isString(property)) { return item[property]; }
    throw "Property must be a function or a property name";
  };

  this.addItem = function(item) {
    var weight = extractWeight(item, weightedProperty) || 0;
    collection.push({ item: item, weight: weight });
  };

  this.assignWeights = function(weightPropertyName) {
    if (!_.isEmpty(collection)) {
      var property = weightPropertyName || 'weight';
      var maxWeight = _.maxBy(collection, 'weight').weight;
      _.each(collection, function(obj) {
        obj.item[property] = isNormalised ? (obj.weight * 1.0 / maxWeight) : obj.weight;
      });
    }
  };
};
