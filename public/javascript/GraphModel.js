var CodeForensics = (function(module) {
  var dasherize = function(s) {
    return s.replace(/[A-Z]/g, function(c, index) {
      return (index !== 0 ? '-' : '') + c.toLowerCase();
    });
  };

  module.GraphModel = function(config) {
    var self = this;
    this.id = config.id;
    this.label = config.label;
    this.diagramType = dasherize(config.diagramClass);
    this.isVisible = ko.observable(false);
    this.diagram = new Diagrams[config.diagramClass]("#" + config.id + " .graph", _.pick(config, "style", "series"));;

    this.populate = function() {
      d3.json(config.url, function(error, series) {
        self.diagram.draw((config.transformData || _.identity).call(null, series));
      });
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
