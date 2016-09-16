var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('../../d3_chart_components/d3_element.js');

module.exports = function() {
  this.bindTo = function(svgObject, model) {
    var allNodes = svgObject.selectAll('circle');

    allNodes.on('click', function(node) {
      model.selectNodes(node);
      _.each(model.chartDefinitions, function(chartDefinition) {
        if (_.isPlainObject(chartDefinition.updateStrategy)) {
          _.each(chartDefinition.updateStrategy.arguments, function(graphicElementDefinition) {
            D3Element.applyProperties(allNodes.filter(graphicElementDefinition.type), graphicElementDefinition.properties);
          });
        }
      });
      d3.event.stopPropagation();
    });
  };
};
