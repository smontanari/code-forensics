var _ = require('lodash');

var D3Element = require('./d3_element.js'),
    D3Tooltip = require('./d3_tooltip.js');

var D3Data = function(parent, definition) {
  var plotDataSeries = function(parentContainer, dataDefinition) {
    var container = D3Element.append(parentContainer, dataDefinition);
    var dataElementSelection = container
                               .selectAll('g')
                               .data(dataDefinition.series)
                               .enter()
                               .append('g');
    if (_.isArray(dataDefinition.subDataElements)) {
      _.each(dataDefinition.subDataElements, function(subDataElement) {
        new D3Data(dataElementSelection, subDataElement);
      });
    }
    _.each(dataDefinition.graphicElements, function(graphicElementDefinition) {
      D3Element.append(dataElementSelection, graphicElementDefinition);
      if (_.isPlainObject(graphicElementDefinition.tooltip)) {
        new D3Tooltip(dataElementSelection, graphicElementDefinition.type, graphicElementDefinition.tooltip);
      }
    });
    return container;
  };

  var dataContainer = plotDataSeries(parent, definition);

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

module.exports = D3Data;
