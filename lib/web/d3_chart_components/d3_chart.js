var _ = require('lodash');

var D3Element = require('./d3_element.js'),
    D3Axis    = require('./d3_axis.js'),
    D3Data    = require('./d3_data.js');

module.exports = function(id, chartDefinition) {
  var data;
  this.name = chartDefinition.name;
  this.svgDocument = D3Element.create('svg', id, chartDefinition.properties);

  if (_.isPlainObject(chartDefinition.axis)) {
    new D3Axis(this.svgDocument, chartDefinition.axis);
  }

  if (_.isPlainObject(chartDefinition.legend)) {
    new D3Data(this.svgDocument, chartDefinition.legend);
  }
  this.updateData = function() {
    if (_.isPlainObject(chartDefinition.updateStrategy)) {
      this[chartDefinition.updateStrategy.method](chartDefinition.updateStrategy.arguments);
    }
  };

  this.resetData = function() {
    if (data) { data.clear(); }
    if (_.isPlainObject(chartDefinition.data)) {
      data = new D3Data(this.svgDocument, chartDefinition.data);
    }
  };

  this.repaintData = function(graphicElementDefinitions) {
    data.repaintGraphicElements(graphicElementDefinitions);
  };

  this.resetData();
};
