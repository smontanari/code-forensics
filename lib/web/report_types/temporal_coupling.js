require('d3');
var _ = require('lodash');

var filters = require('../filters/index.js');

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
        graph: {
          label: 'from ' + dates[0] + ' to ' + dates[1],
          dataFile: data.fileUrl,
          diagramType: 'CirclePackingDiagram',
          dataEvents: {
            onDataModel: function(dataModel) {
              dataModel.nodesArray = _.filter(dataModel.nodesArray, function(node) {
                return node.fullName() === modulePath || node.isRoot() || !node.isLeaf() || node.couplingDegree > 0;
              });
              return dataModel;
            }
          }
        },
        diagram: {
          style: {
            diameter: 950,
            colorScale: d3.scale.linear().domain([-1, 5]).range(['hsl(185,60%,99%)', 'hsl(187,40%,70%)']).interpolate(d3.interpolateHcl),
            colorValues: { weightColor: '#990012', noColor: '#F5F5F5' },
            nodeHighlight: { name: modulePath, color: "#2B65EC" }
          },
          series: { valueProperty: "sloc", valueLabel: 'Lines Of Code', weightProperty: 'couplingDegree', weightLabel: 'Coupling degree', calculatedWeightProperty: 'weight' }
        }
      };
    })
  };
};
