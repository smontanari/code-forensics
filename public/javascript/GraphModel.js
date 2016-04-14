var CodeForensics = (function(module) {
  var dasherize = function(s) {
    return s.replace(/[A-Z]/g, function(c, index) {
      return (index !== 0 ? '-' : '') + c.toLowerCase();
    });
  };

  module.GraphModel = function(diagramConfig) {
    var self = this;
    this.id = diagramConfig.id;
    this.label = diagramConfig.label;
    this.diagramType = dasherize(diagramConfig.diagramClass);
    this.isSelected = ko.observable(false);
    this.diagram = new Diagrams[diagramConfig.diagramClass]("#" + diagramConfig.id + " .graph", _.pick(diagramConfig, "style", "series"));;

    this.populate = function() {
      var deferred = Q.defer();
      d3.json(diagramConfig.url, function(error, series) {
        self.diagram.onData((diagramConfig.transformData || _.identity).call(null, series));
        deferred.resolve();
      });
      return deferred.promise;
    };
  };

  var graphExtensions = {
    LineChartDiagram: {
      controlsTemplate: null
    },
    BarChartDiagram: {
      controlsTemplate: null
    },
    WordCloudDiagram: {
      controlsTemplate: null
    },
    CirclePackingDiagram: {
      controlsTemplate: "size-range-control-template"
    }
  };

  module.GraphModel.create = function(config) {
    var model = new module.GraphModel(config);
    return _.extend(model, graphExtensions[config.diagramClass]);
  };

  return module;
})(CodeForensics || {});
