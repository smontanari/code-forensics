var CodeForensics = (function(module) {
  var dasherize = function(s) {
    return s.replace(/[A-Z]/g, function(c, index) {
      return (index !== 0 ? '-' : '') + c.toLowerCase();
    });
  };

  module.GraphModel = function(graphConfig) {
    var self = this;
    this.id = graphConfig.id;
    this.label = graphConfig.label;
    this.diagramType = dasherize(graphConfig.diagram.type);
    this.isSelected = ko.observable(false);
    this.controlsTemplateId = graphConfig.controlsTemplateId;
    this.diagram = new Diagrams[graphConfig.diagram.type]('#' + graphConfig.id + ' .graph', _.pick(graphConfig.diagram, 'style', 'series', 'filters'));

    this.populate = function() {
      var deferred = Q.defer();
      d3.json(graphConfig.url, function(error, series) {
        self.diagram.onData((graphConfig.transformData || _.identity).call(null, series));
        deferred.resolve();
      });
      return deferred.promise;
    };
  };

  module.GraphModel.create = function(config) {
    return new module.GraphModel(config);
  };

  return module;
})(CodeForensics || {});
