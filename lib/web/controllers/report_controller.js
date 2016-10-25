var _ = require('lodash'),
    Q = require('q');

module.exports = function(graphModels) {
  this.selectGraph = function(graphModel) {
    _.each(graphModels, function(g) {
      g.isSelected(g.id === graphModel.id);
    });
  };

  Q.allSettled(_.invokeMap(graphModels, 'initialize')).then(function() {
    graphModels[0].isSelected(true);
  });
};
