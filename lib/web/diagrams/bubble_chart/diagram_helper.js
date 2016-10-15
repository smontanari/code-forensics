var DefaultHelper       = require('../default_diagram_helper.js'),
    PackLayoutAdapter   = require('./pack_layout_adapter.js'),
    CircleSelectHandler = require('./circle_select_handler.js'),
    NodeHelper          = require('./node_helper.js');

module.exports = function(diagram) {
  DefaultHelper.call(this, diagram);
  var nodeHelper = new NodeHelper(this.configuration);

  this.layoutAdapter = new PackLayoutAdapter(this.configuration.style.diameter, nodeHelper);

  this.graphHandlers.push(new CircleSelectHandler());

  this.createModel = function(series) {
    return new diagram.Model(this.configuration.style.diameter, series, nodeHelper);
  };
};
