var _ = require('lodash');
var d3 = require('d3');

var D3Element = require('./d3_element.js'),
    D3Axis    = require('./d3_axis.js'),
    D3Brush   = require('./d3_brush.js'),
    D3Zoom    = require('./d3_zoom.js'),
    D3Data    = require('./d3_data.js');

module.exports = function(id, chartDefinition) {
  var dataContainer;
  var dataElements = {};
  var documentContainer = D3Element.create('svg', id, chartDefinition);

  var createDataElement = function(definition) {
    dataElements[definition.key] = new D3Data(dataContainer, definition);
  };

  if (_.isPlainObject(chartDefinition.axis)) {
    this.axis = new D3Axis(documentContainer, chartDefinition.axis);
  }

  if (_.isPlainObject(chartDefinition.brush)) {
    this.brush = new D3Brush(documentContainer, chartDefinition.brush);
  }

  if (_.isPlainObject(chartDefinition.zoom)) {
    this.zoom = new D3Zoom(documentContainer, chartDefinition.zoom);
  }

  if (_.isPlainObject(chartDefinition.data)) {
    dataContainer = D3Element.append(documentContainer, chartDefinition.data);
    _.each(_.compact(chartDefinition.data.dataElements), createDataElement);
  }
  this.name = chartDefinition.name;
  this.svgDocument = documentContainer;

  this.updateData = function() {
    var self = this;
    if (_.isPlainObject(chartDefinition.updateStrategy)) {
      _.each(chartDefinition.updateStrategy.dataElements, function(dataElement) {
        self[dataElement.method](dataElement.key, dataElement.arguments);
      });
    }
  };

  this.resetData = function(key) {
    dataElements[key].clear();
    createDataElement(_.find(chartDefinition.data.dataElements, { 'key': key }));
  };

  this.repaintData = function(key, args) {
    dataElements[key].repaintGraphicElements(args);
  };
};
