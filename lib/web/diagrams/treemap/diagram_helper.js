var DefaultHelper        = require('../default_diagram_helper.js'),
    TreemapLayoutAdapter = require('./treemap_layout_adapter.js'),
    NodeHelper           = require('./node_helper.js'),
    ZoomHandler          = require('./zoom_handler.js');

module.exports = function(diagram) {
  DefaultHelper.call(this, diagram);
  var nodeHelper = new NodeHelper(this.configuration);

  this.layoutAdapter = new TreemapLayoutAdapter(this.configuration.style.width, this.configuration.style.height, nodeHelper);

  this.graphHandlers.push(new ZoomHandler(nodeHelper));

  this.createModel = function(series) {
    return new diagram.Model(this.configuration, series, nodeHelper);
  };
};
