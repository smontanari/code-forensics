var _  = require('lodash')
    ko = require('knockout');

var GraphModel = require('./models/graph_model.js');
var GraphController = require('./controllers/graph_controller.js');
var graphTypes = require('./graph_types/index.js');

var getTimePeriod = function(parameters) {
  if (parameters.timePeriod) {
    var timePeriod = parameters.timePeriod.getValue();
    var dates = timePeriod.split('_');
    return { from: dates[0], to: dates[1] };
  }
};

module.exports = function(parameters) {
  var graphConfiguration = graphTypes[parameters.graphType.getValue()](_.omit(parameters, 'graphType'));
  this.metadata = graphConfiguration.metadata;
  this.graphModels = _.map(graphConfiguration.graphModels, GraphModel.create);
  this.controller = new GraphController(this.graphModels);
  this.hasMultipleGraphs = this.graphModels.length > 1;
  this.timePeriod = ko.observable();
  this.timePeriod(getTimePeriod(parameters));
};
