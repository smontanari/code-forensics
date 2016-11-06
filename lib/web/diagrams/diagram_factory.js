var Diagram = require('./diagram.js');

var HELPERS = {
  default:         require('./default_diagram_helper.js'),
  line_chart:      require('./line_chart/diagram_helper.js'),
  enclosure_chart: require('./enclosure_chart/diagram_helper.js'),
  bubble_chart:    require('./bubble_chart/diagram_helper.js'),
  word_cloud:      require('./word_cloud/diagram_helper.js'),
  treemap:         require('./treemap/diagram_helper.js')
};

module.exports = {
  create: function(id, diagramConfig) {
    var DiagramHelper = HELPERS[diagramConfig.type] || HELPERS.default;
    return new Diagram(id, new DiagramHelper(diagramConfig));
  }
};
