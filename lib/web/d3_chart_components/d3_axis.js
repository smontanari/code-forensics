var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('./d3_element.js');

module.exports = function(parent, definition) {
  var axisContainer = D3Element.append(parent, definition);

  _.each(definition.axisElements, function(axisElementDefinition) {
    var axisElement = D3Element.append(axisContainer, axisElementDefinition);
    if (axisElementDefinition.value) {
      var axisValue = d3[axisElementDefinition.value]();
      _.each(axisElementDefinition.settings, function(v, k) {
        axisValue[k](v);
      });
      axisElement.call(axisValue);
    }

    if (_.isPlainObject(axisElementDefinition.labels)) {
      D3Element.applyProperties(axisElement.selectAll('.tick text'), axisElementDefinition.labels);
    }
  });
};
