var CodeForensics = (function(module) {
  module.ViewModel = function(parameters) {
    var self = this;
    var graphConfig = module.GraphTypeFactory[parameters.graphType.getValue()](_.omit(parameters, 'graphType'));
    this.metadata = graphConfig.metadata;
    this.graphModels = _.map(graphConfig.graphs, module.GraphModel.create);
    this.controller = new module.GraphController(this.graphModels);
  };

  return module;
})(CodeForensics || {});
