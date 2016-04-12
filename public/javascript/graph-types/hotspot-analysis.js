var CodeForensics = (function(module) {
  var graphConfiguration = function(parameters) {
    var dataFile = "data/revisions-hotspot-data.json";
    return {
      title: "Hotspot Analysis",
      description: "Module size/complexity vs churn (number or revisions)",
      diagrams: _.map([
        { value: "sloc", label: "Lines Of Code" },
        { value: "totalComplexity", label: "Complexity" }
        // { value: "duplication", label: "Duplication" }
      ], function(g) {
        return {
          id: "hs-" + g.value, label: g.label,
          diagramClass: "CirclePackingDiagram",
          style: {
            diameter: 960, margin: 10,
            colorRange: { from: "hsl(185,60%,99%)", to: "hsl(187,40%,70%)" },
            colorValues: { weightColor: "#990012", noColor: "#F5F5F5" }
          },
          series: { valueProperty: g.value },
          url: dataFile
        };
      })
    };
  }

  module.GraphTypeFactory = _.extend(module.GraphTypeFactory || {}, {
    "hostspot-analysis": graphConfiguration
  });
  return module;
})(CodeForensics || {});
