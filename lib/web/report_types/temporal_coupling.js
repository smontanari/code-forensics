require('d3');
var _ = require('lodash');

var DiagramModel = require('../diagrams/circle_packing/diagram_model.js');

module.exports = function(manifest) {
  var modulePath = manifest.targetFile;

  return {
    metadata: {
      title: 'Temporal Coupling analysis',
      description: 'file: ' + modulePath,
      diagramSelectionTitle: 'Time period',
      dateRange: manifest.parseDateRange()
    },
    graphModels: _.map(manifest.dataFiles, function(data) {
      var dates = data.timePeriod.split('_');
      return {
        id: 'tc-' + data.timePeriod,
        label: 'from ' + dates[0] + ' to ' + dates[1],
        dataFile: data.fileUrl,
        diagram: {
          type: 'circle_packing',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram',
              width: 960,
              height: 960,
              diameter: 950,
              colorScale: d3.scale.linear().domain([-1, 5]).range(['hsl(185,60%,99%)', 'hsl(187,40%,70%)']).interpolate(d3.interpolateHcl),
              colorValues: { weightColor: '#990012', noColor: '#F5F5F5' },
              nodeHighlight: { name: modulePath, color: "#2B65EC" }
            },
            series: { valueProperty: "sloc", valueLabel: 'Lines Of Code', weightProperty: 'couplingDegree', weightLabel: 'Coupling degree', calculatedWeightProperty: 'weight' }
          },
          dataTransform: function(nodesArray) {
            return _.filter(nodesArray, function(node) {
              return node.fullName() === modulePath || node.isRoot() || !node.isLeaf() || node.couplingDegree > 0;
            });
          }
        }
      };
    })
  };
};
