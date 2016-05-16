var _ = require('lodash');
var GraphModel = require('./models/graph_model.js');
var GraphController = require('./controllers/graph_controller.js');
var graphTypes = require('./graph_types/index.js');

module.exports = function(parameters) {
  var graphConfig = graphTypes[parameters.graphType.getValue()](_.omit(parameters, 'graphType'));
  this.metadata = graphConfig.metadata;
  this.graphModels = _.map(graphConfig.graphs, GraphModel.create);
  this.controller = new GraphController(this.graphModels);
};
