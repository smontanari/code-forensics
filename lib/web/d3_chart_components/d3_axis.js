var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(parent, definition) {
  var axisContainer = D3Element.create('g', parent, definition.properties);

  _.each(definition.axisElements, function(axisElementDefinition) {
    var axisElement = D3Element.create('g', axisContainer, axisElementDefinition.properties);
    if (axisElementDefinition.value) {
      var axisValue = d3[axisElementDefinition.value]();
      _.each(axisElementDefinition.settings, function(v, k) {
        axisValue[k](v);
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
