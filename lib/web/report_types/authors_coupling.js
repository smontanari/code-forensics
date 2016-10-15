var DiagramModel = require('../diagrams/bubble_chart/diagram_model.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Author coupling analysis',
      description: 'sharing of files between programmers',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'auth',
        dataFile: manifest.dataFiles[0].fileUrl,
        templates: [
          { name: 'tooltip-template', type: 'mustache', id: 'circle-pack-tooltip-template', file: 'circle-pack-tooltip-template.html' }
        ],
        diagram: {
          type: 'bubble_chart',
          Model: DiagramModel,
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram authors-coupling',
              width: 960,
              height: 960,
              diameter: 950,
              weightedNodeColor: '#990012',
              selectedNodeColor: '#00AB1A',
              linkedNodesColorRange: ['#1269FC', '#CADDFC']
            },
            series: {
              maxLinkedNodes: manifest.maxCoupledFiles,
              nameProperty: 'path', valueProperty: 'authors', valueLabel: 'Authors', calculatedWeightProperty: 'weight',
              linkedNodesProperty: 'coupledEntries', linkProperty: 'path', linkDegreeProperty: 'couplingDegree'
            },
            tooltipInfo: {
              templateId: 'circle-pack-tooltip-template',
              templateModel: [
                { label: 'Authors', valueProperty: 'authors' },
                { label: 'Revisions', valueProperty: 'revisions' },
                { label: 'Main dev', valueProperty: 'mainDev' },
                { label: 'Ownership', valueProperty: 'ownership' },
              ]
            },
            selectedTooltipInfo: {
              templateId: 'circle-pack-tooltip-template',
              templateModel: {
                linkedNodeProperties: [
                  { label: 'Main dev', valueProperty: 'mainDev' },
                  { label: 'Ownership', valueProperty: 'ownership' },
                ],
                selectedNodeProperties: [
                  { label: 'Coupling degree', valueProperty: 'couplingDegree' },
                  { label: 'Revisions (avg)', valueProperty: 'revisionsAvg' },
                ]
              }
            }
          }
        }
      }
    ]
  };
};
