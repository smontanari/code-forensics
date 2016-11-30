var _  = require('lodash');

var Model            = require('../diagrams/treemap/diagram_model.js'),
    LayoutAdapter    = require('../diagrams/treemap/treemap_layout_adapter.js'),
    ZoomHandler      = require('../diagrams/treemap/zoom_handler.js');

module.exports = function(manifest) {
  var diagramConfig = {
    Model: Model,
    layoutAdapter: new LayoutAdapter({ width: 960, height: 700, valueProperty: 'revisions' }),
    graphHandlers: [new ZoomHandler()],
    configuration: {
      style: {
        cssClass: 'treemap-diagram',
        width: 960,
        height: 700,
        margin: { top: 24, right: 0, bottom: 0, left: 0 },
      },
      series: { valueProperty: 'revisions' }
    }
  };

  return {
    metadata: {
      title: 'Developer effort analysis',
      description: 'effort distribution (revisions) between programmers/teams',
      diagramSelectionTitle: 'Effort distribution',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'dev-effort',
        label: 'By developer',
        dataFile: _.find(manifest.dataFiles, { fileType: 'individual-effort' }).fileUrl,
        controlTemplates: {
          widgets: [
            { name: 'colorMapWidgetTemplate', data: { label: 'Developers' } }
          ]
        },
        diagram: diagramConfig
      },
      {
        id: 'team-effort',
        label: 'By team',
        dataFile: _.find(manifest.dataFiles, { fileType: 'team-effort' }).fileUrl,
        controlTemplates: {
          widgets: [
            { name: 'colorMapWidgetTemplate', data: { label: 'Teams' } }
          ]
        },
        diagram: diagramConfig
      }
    ]
  };
};
