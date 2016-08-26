var _ = require('lodash');

var D3Element = require('./d3_element.js'),
    D3Tooltip = require('./d3_tooltip.js');

module.exports = function(parent, definition) {
  var dataContainer = D3Element.create('g', parent, definition.properties);
  var containerElement = dataContainer,
      dataDefinition = definition;
  if (definition.group) {
    containerElement = dataContainer.selectAll('.d3-data-plot-group').data(definition.series).enter().append('g');
    D3Element.applyProperties(containerElement, definition.group.properties);
    dataDefinition = definition.group;
  }
  var dataElement = containerElement.selectAll('.d3-data-plot').data(dataDefinition.series).enter();
  _.each(dataDefinition.graphicElements, function(graphicElementDefinition) {
    var graphicElement = dataElement.append(graphicElementDefinition.type);
    D3Element.applyProperties(graphicElement, graphicElementDefinition.properties);
    if (graphicElementDefinition.tooltip) {
      new D3Tooltip(containerElement, graphicElementDefinition.type, graphicElementDefinition.tooltip);
    }
  });

  this.repaintGraphicElements = function(definitions) {
    _.each(definitions, function(graphicElementDefinition) {
      var graphicElement = dataContainer.selectAll(graphicElementDefinition.type);
      D3Element.applyProperties(graphicElement, graphicElementDefinition.properties);
    });
  };

  this.clear = function() {
    dataContainer.remove();
  };

  this.element = dataContainer;
};
