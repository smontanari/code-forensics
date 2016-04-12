var CodeForensics = (function(module) {
  module.GraphController = function(graphModels) {
    graphModels[0].isVisible(true);

    this.selectGraph = function(graphModel) {
      _.each(_.reject(graphModels, function(g) { return g.id === graphModel.id; }), function(g) { g.isVisible(false); });
      _.find(graphModels, function(g) { return g.id === graphModel.id; }).isVisible(true);
    };

    _.each(graphModels, function(graphModel) {
      graphModel.populate();
    });
  };

  return module;
})(CodeForensics || {});
