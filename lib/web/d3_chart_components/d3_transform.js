/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var TRANSLATE_DEFAULT = { x: 0, y: 0 };

module.exports = function() {
  var transforms = [];

  this.withOffset = function(value) {
    if (_.isPlainObject(value)) {
      var offset = _.defaults({}, value, TRANSLATE_DEFAULT);
      transforms.push('translate(' + [offset.x, offset.y].join(',') + ')');
    } else if (_.isFunction(value)) {
      transforms.push(function() {
        var offset = _.defaults(value.apply(null, arguments), TRANSLATE_DEFAULT);
        return 'translate(' + [offset.x, offset.y].join(',') + ')';
      });
    }
    return this;
  };

  this.withRotation = function(value) {
    if (_.isNumber(value)) {
      transforms.push('rotate(' + value + ')');
    } else if (_.isFunction(value)) {
      transforms.push(function() {
        return 'rotate(' + _.spread(value)(arguments) + ')';
      });
    }
    return this;
  };

  this.applyToElement = function(d3Element) {
    if (!_.isEmpty(transforms)) {
      d3Element.attr('transform', function() {
        var args = arguments;
        return _.map(transforms, function(value) {
          if (_.isFunction(value)) { return value.apply(null, args); }
          return value;
        }).join('');
      });
    }
  };
};
