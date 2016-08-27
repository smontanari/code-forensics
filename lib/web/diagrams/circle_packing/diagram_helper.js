var DefaultHelper = require('../default_diagram_helper.js'),
    PackAdapter   = require('./pack_series_adapter.js'),
    NodeHelper    = require('./node_helper.js'),
    ZoomHandler   = require('./zoom_handler.js');

module.exports = function(diagram) {
  DefaultHelper.call(this, diagram);
  var nodeHelper = new NodeHelper(this.configuration);

  this.seriesAdapter = new PackAdapter(this.configuration.style.diameter, nodeHelper);
  this.graphHandlers = {
    main: [new ZoomHandler(this.configuration.style.diameter)]
  };

  this.createModel = function(series) {
    return new diagram.Model(this.configuration.style.diameter, series, nodeHelper);
  };
};
