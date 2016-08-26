require('d3');
var _ = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(parent, definition) {
  var axisContainer = D3Element.create('g', parent, definition.properties);

  _.each(definition.axisElements, function(axisElementDefinition) {
    var axisElement = D3Element.create('g', axisContainer, axisElementDefinition.properties);
    if (_.isPlainObject(axisElementDefinition.value)) {
      var axisValue = d3.svg.axis();
      _.each((axisElementDefinition.value || {}), function(value, key) {
        axisValue[key](value);
      });
      axisElement.call(axisValue);
    }

    if (_.isPlainObject(axisElementDefinition.labels)) {
      D3Element.applyProperties(axisElement.selectAll('text'), axisElementDefinition.labels);
    }

    if (_.isPlainObject(axisElementDefinition.title)) {
      D3Element.create('text', axisElement, axisElementDefinition.title);
    }
  });
};
