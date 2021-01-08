/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function(groupDefinitions, opts) {
  var values = [];
  var options = opts || {};

  this.name = _.map(groupDefinitions, 'name').join(' - ');
  this.groupDefinitions = groupDefinitions;

  this.addValue = function(obj) {
    values.push(obj);
  };

  this.hasAnyKey = function(group, names) {
    var groupDefinition = _.find(groupDefinitions, { 'group': group });
    return _.includes(names, groupDefinition.name);
  };

  this.allValues = function() {
    if (options.sortBy) {
      return _.sortBy(values, options.sortBy);
    }
    return values;
  };
};
