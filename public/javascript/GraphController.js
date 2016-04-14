var CodeForensics = (function(module) {
  module.GraphController = function(graphModels) {
    var initialize = function() {
      Q.allSettled(_.invokeMap(graphModels, 'populate')).then(function() {
        graphModels[0].isSelected(true);
      });
    };

    this.selectGraph = function(graphModel) {
      _.each(graphModels, function(g) {
        g.isSelected(g.id === graphModel.id);
      });
    };

    initialize();
  };

  return module;
})(CodeForensics || {});
