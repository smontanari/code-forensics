/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var D3Element = require('./d3_element.js'),
    D3Axis    = require('./d3_axis.js'),
    D3Brush   = require('./d3_brush.js'),
    D3Zoom    = require('./d3_zoom.js'),
    D3Data    = require('./d3_data.js');

var COMPONENT_TYPES = {
  axis:  D3Axis,
  brush: D3Brush,
  zoom:  D3Zoom,
  data:  D3Data
};

module.exports = function(container, definition) {
  this.name = definition.name;
  this.value = new COMPONENT_TYPES[definition.componentType](container, definition);

  this.reset = function() {
    this.value.element.remove();
    this.value = new COMPONENT_TYPES[definition.componentType](container, definition);
  };

  this.repaint = function(repaintDefinitions) {
    var self = this;
    _.each(repaintDefinitions, function(repaintDefinition) {
      var element = self.getElement().selectAll(repaintDefinition.elementSelection);
      D3Element.applyProperties(element, repaintDefinition.properties);
    });
  };

  this.getElement = function() {
    return this.value.element;
  };
};
