/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(parent, definition) {
  var axisElement = D3Element.append(parent, definition);
  var axisBehavior;

  if (definition.behavior) {
    axisBehavior = d3[definition.behavior]();
    _.each(definition.settings, function(v, k) {
      axisBehavior[k](v);
    });
    axisElement.call(axisBehavior);
  }

  if (_.isPlainObject(definition.labels)) {
    D3Element.applyDefinition(axisElement.selectAll('.tick text'), definition.labels);
  }

  this.repaint = function() {
    axisElement.call(axisBehavior);
  };

  this.axisBehavior = axisBehavior;
};
