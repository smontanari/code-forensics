var _  = require('lodash');

var DiagramModel = require('../diagrams/enclosure_chart/diagram_model.js');

module.exports = function(manifest) {
  var modulePath = manifest.parameters.targetFile;

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
        templates: [
          { id: 'circle-pack-tooltip', type: 'mustache', file: 'circle_pack_tooltip_template.html' }
        ],
        diagram: {
          type: 'enclosure_chart',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram hotspot-analysis',
              width: 960,
              height: 960,
              diameter: 950,
              nodeDepthColorRange: ['hsl(185,60%,99%)', 'hsl(187,40%,70%)'],
              weightedNodeColor: '#990012',
              nodeHighlight: { name: modulePath, color: '#1269FC' }
            },
            series: { valueProperty: 'sloc', calculatedWeightProperty: 'weight' },
            tooltipInfo: {
              templateId: 'circle-pack-tooltip',
              templateProperties: [
                { label: 'Coupling degree', valueProperty: 'couplingDegree' }
              ]
            },
          },
          dataTransform: function(nodesArray) {
            return _.filter(nodesArray, function(node) {
              return node.fullName() === modulePath || node.isRoot() || !node.isLeaf() || node.data.couplingDegree > 0;
            });
          }
        }
      };
    })
  };
};
