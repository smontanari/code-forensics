var _  = require('lodash');

var Model         = require('../diagrams/enclosure_chart/default_diagram_model.js'),
    LayoutAdapter = require('../diagrams/enclosure_chart/pack_layout_adapter.js'),
    ZoomHandler   = require('../diagrams/enclosure_chart/zoom_handler.js'),
    filters       = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Knowledge Map analysis',
      description: 'Knowledge distribution between developers',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      {
        id: 'knowledge-map',
        dataFile: manifest.dataFiles[0].fileUrl,
        templates: [
          { id: 'range-filters', type: 'ko', file: 'range_filters_control_template.html', layout: 'graphControls' },
          { id: 'color-legend', type: 'ko', file: 'color_lengend_control_template.html', layout: 'graphControls' },
          { id: 'circle-pack-tooltip', type: 'mustache', file: 'circle_pack_tooltip_template.html' }
        ],
        diagram:{
          Model: Model,
          layoutAdapter: new LayoutAdapter({ diameter: 950, valueProperty: 'sloc' }),
          graphHandlers: [new ZoomHandler({ diameter: 950 })],
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram',
              width: 960,
              height: 960,
              diameter: 950,
              nodeDepthColorRange: ['hsl(250,0%,90%)', 'hsl(260,0%,60%)']
            },
            tooltipInfo: {
              templateId: 'circle-pack-tooltip',
              templateProperties: [
                { label: 'Developer', valueProperty: 'mainDev' },
                { label: 'Team', valueProperty: 'team' },
                { label: 'Ownership', valueProperty: 'ownership' },
                { label: 'Added lines', valueProperty: 'addedLines' }
              ]
            },
            filters: {
              valueFilter: new filters.MetricRange('Lines of code'),
            //   weightFilter: new filters.PercentageMetricRange('Churn level %')
            }
          },
          dataTransform: function(nodesArray) {
            return _.filter(nodesArray, function(node) {
              return !node.isLeaf() || _.isString(node.data.mainDev);
            });
          }
        }
      }
    ]
  };
};
