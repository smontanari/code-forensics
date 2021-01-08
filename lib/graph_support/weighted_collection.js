/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _      = require('lodash'),
    logger = require('../log');

module.exports = function(weightedProperty, normalised) {
  var collection = [];
  var isNormalised = Boolean(normalised);

  var extractWeight = function(item, property) {
    if (_.isFunction(property)) { return property(item); }
    if (_.isString(property)) { return item[property]; }
    throw new Error('Property must be a function or a property name');
  };

  var weightCalculatorFn = function() {
    var maxWeight = _.maxBy(collection, 'weight').weight;
    if (maxWeight === 0) {
      logger.warn("Can't determine weight of collection. Assigning a value of 0 to every item.");
      return _.constant(0);
    }
    if (isNormalised) {
      return function(obj) { return obj.weight * 1.0 / maxWeight; };
    }
    return _.property('weight');
  };

  this.addItem = function(item) {
    var weight = extractWeight(item, weightedProperty) || 0;
    collection.push({ item: item, weight: weight });
  };

  this.assignWeights = function(weightPropertyName) {
    if (!_.isEmpty(collection)) {
      var property = weightPropertyName || 'weight';
      var weightCalculator = weightCalculatorFn();
      _.each(collection, function(obj) {
        obj.item[property] = weightCalculator(obj);
      });
    }
  };
};
