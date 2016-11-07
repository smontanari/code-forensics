var _ = require('lodash');

var D3Element = require('./d3_element.js'),
    D3Axis    = require('./d3_axis.js'),
    D3Brush   = require('./d3_brush.js'),
    D3Zoom    = require('./d3_zoom.js'),
    D3Data    = require('./d3_data.js');

module.exports = function(id, chartDefinition) {
  var COMPONENT_TYPES = {
    axis:  D3Axis,
    brush: D3Brush,
    zoom:  D3Zoom,
    data:  D3Data
  };
  var components = [];
  var documentContainer = D3Element.create('svg', id, chartDefinition);

  _.each(_.compact(chartDefinition.components), function(componentDefinition) {
    components.push({
      name: componentDefinition.name,
      value: new COMPONENT_TYPES[componentDefinition.componentType](documentContainer, componentDefinition)
    });
  });

  this.name = chartDefinition.name;
  this.svgDocument = documentContainer;

  this.getComponentByName = function(name) {
    var c = _.find(components, { 'name': name });
    if (_.isUndefined(c)) { throw 'Component "' + name + '" does not exist'; }
    return c.value;
  };

  this.updateData = function() {
    var self = this;
    if (_.isPlainObject(chartDefinition.updateStrategy)) {
      _.each(chartDefinition.updateStrategy.components, function(updateDefinition) {
        self[updateDefinition.method](updateDefinition.name, updateDefinition.arguments);
      });
    }
  };

  this.resetData = function(key) {
    var component = _.find(components, { 'name': key });
    component.value.clear();
    var dataDefinition = _.find(chartDefinition.components, { 'name': key });
    component.value = new D3Data(documentContainer, dataDefinition);
  };

  this.repaintData = function(key, args) {
    var component = _.find(components, { 'name': key });
    component.value.repaintGraphicElements(args);
  };
};
