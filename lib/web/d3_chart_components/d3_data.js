/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var D3Element = require('./d3_element.js'),
    D3Tooltip = require('./d3_tooltip.js');

var D3Data = function(parent, definition) {
  var container = D3Element.append(parent, definition);
  var dataElementSelection = container
                             .selectAll('g')
                             .data(definition.series)
                             .enter()
                             .append('g');
  var tooltip = null;
  if (_.isArray(definition.subDataElements)) {
    _.each(definition.subDataElements, function(subDataElement) {
      new D3Data(dataElementSelection, subDataElement);
    });
  }
  _.each(definition.graphicElements, function(graphicElementDefinition) {
    D3Element.append(dataElementSelection, graphicElementDefinition);
    if (_.isPlainObject(graphicElementDefinition.tooltip)) {
      tooltip = new D3Tooltip(dataElementSelection, graphicElementDefinition.elementType, graphicElementDefinition.tooltip);
    }
  });

  var toggleTooltip = function(enabled) {
    if (tooltip) {
      enabled ? tooltip.enable() : tooltip.disable();
    }
  };

  this.element = container;

  this.activate = function() {
    toggleTooltip(true);
  };

  this.deactivate = function() {
    toggleTooltip(false);
  };
};

module.exports = D3Data;
