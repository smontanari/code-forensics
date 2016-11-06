var DefaultHelper    = require('../default_diagram_helper.js'),
    ZoomBrushHandler = require('./zoom_brush_handler.js');

module.exports = function(diagram) {
  DefaultHelper.call(this, diagram);

  this.graphHandlers.push(new ZoomBrushHandler());

  this.createModel = function(series) {
    return new diagram.Model(this.configuration, series);
  };
};
