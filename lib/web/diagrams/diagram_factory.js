var Diagram = require('./diagram.js');

var HELPERS = {
  default: require('./default_diagram_helper.js'),
  circle_packing: require('./circle_packing/diagram_helper.js')
};

module.exports = {
  create: function(id, diagramConfig) {
    var DiagramHelper = HELPERS[diagramConfig.type] || HELPERS.default;
    return new Diagram(id, new DiagramHelper(diagramConfig));
  }
};
