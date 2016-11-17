var Model         = require('../diagrams/bubble_chart/diagram_model.js'),
    LayoutAdapter = require('../diagrams/bubble_chart/pack_layout_adapter.js'),
    SelectHandler = require('../diagrams/bubble_chart/circle_select_handler.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Author coupling analysis',
      description: 'sharing of files between programmers',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'authors-coupling',
        dataFile: manifest.dataFiles[0].fileUrl,
        templates: [
          { id: 'circle-pack-tooltip', type: 'mustache', file: 'circle_pack_tooltip_template.html' }
        ],
        diagram: {
          Model: Model,
          layoutAdapter: new LayoutAdapter({ diameter: 950, nameProperty: 'path', valueProperty: 'authors' }),
          graphHandlers: [new SelectHandler()],
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram',
              width: 960,
              height: 960,
              diameter: 950,
              weightedNodeColor: '#990012',
              selectedNodeColor: '#00AB1A',
              linkedNodesColorRange: ['#1269FC', '#CADDFC']
            },
            series: {
              maxLinkedNodes: manifest.parameters.maxCoupledFiles,
              nameProperty: 'path', valueProperty: 'authors', valueLabel: 'Authors', calculatedWeightProperty: 'weight',
              linkedNodesProperty: 'coupledEntries', linkProperty: 'path', linkDegreeProperty: 'couplingDegree'
            },
            tooltipInfo: {
              templateId: 'circle-pack-tooltip',
              templateModel: [
                { label: 'Authors', valueProperty: 'authors' },
                { label: 'Revisions', valueProperty: 'revisions' },
                { label: 'Main dev', valueProperty: 'mainDev' },
                { label: 'Ownership', valueProperty: 'ownership' },
              ]
            },
            selectedTooltipInfo: {
              templateId: 'circle-pack-tooltip',
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
