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
    this.controlsTemplateId = ko.observable(null);
    this.diagram = new Diagrams[graphConfig.diagram.type]('#' + graphConfig.id + ' .graph', _.pick(graphConfig.diagram, 'style', 'series', 'filters'));

    this.initialize = function() {
      return Q.all([
        module.asyncLoader.loadData(graphConfig.dataFile).then(function(series) {
          self.diagram.onData((graphConfig.transformData || _.identity).call(null, series));
        }),
        module.asyncLoader.loadHtmlTemplate(graphConfig.controlsTemplate.id, graphConfig.controlsTemplate.file)
        .then(function() {
          self.controlsTemplateId(graphConfig.controlsTemplate.id);
        })
      ]);
    };
  };

  module.GraphModel.create = function(config) {
    return new module.GraphModel(config);
  };

  return module;
})(CodeForensics || {});
