var CodeForensics = (function(module) {
  var graphConfiguration = function(parameters) {
    return {
      title: "Hotspot Analysis",
      description: "Module metrics vs churn (number or revisions)",
      diagrams: _.map([
        { value: "sloc", label: "Lines Of Code" },
        { value: "totalComplexity", label: "Complexity" }
      ], function(diagram) {
        return {
          id: "hs-" + diagram.value, label: diagram.label,
          diagramClass: "CirclePackingDiagram",
          style: {
            diameter: 960, margin: 10,
            colorRange: { from: "hsl(185,60%,99%)", to: "hsl(187,40%,70%)" },
            colorValues: { weightColor: "#990012", noColor: "#F5F5F5" }
          },
          series: { valueProperty: diagram.value, weightProperty: 'weight' },
          url: "data/revisions-hotspot-data.json"
        };
      })
    };
  }

  module.GraphTypeFactory = _.extend(module.GraphTypeFactory || {}, {
    "hostspot-analysis": graphConfiguration
  });
  return module;
})(CodeForensics || {});
