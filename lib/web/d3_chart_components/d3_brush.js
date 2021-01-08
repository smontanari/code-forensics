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
  var self = this;
  this.element = D3Element.append(parent, definition);

  switch (definition.orientation) {
    case 'horizontal':
      this.brushBehavior = d3.brushX();
      break;
    case 'vertical':
      this.brushBehavior = d3.brushY();
      break;
    default:
      this.brushBehavior = d3.brush();
  }

  _.each(definition.settings, function(v, k) {
    self.brushBehavior[k](v);
  });

  this.element.call(this.brushBehavior);
  if (definition.activeSelection) {
    this.element.call(this.brushBehavior.move, definition.activeSelection);
  }

  this.setActiveSelection = function(range) {
    this.element.call(this.brushBehavior.move, range);
  };

};
