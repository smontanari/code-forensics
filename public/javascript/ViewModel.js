var CodeForensics = (function(module) {
  module.ViewModel = function(parameters) {
    var self = this;
    var graphConfig = module.GraphTypeFactory[parameters.graphType.getValue()](_.omit(parameters, 'graphType'));
    this.title = graphConfig.title;
    this.description = graphConfig.description;
    this.graphModels = _.map(graphConfig.diagrams, module.GraphModel.create);
    this.controller = new module.GraphController(this.graphModels);
  };

  return module;
})(CodeForensics || {});
