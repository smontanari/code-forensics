var _ = require('lodash');

var Model            = require('../diagrams/enclosure_chart/weighted_diagram_model.js'),
    LayoutAdapter    = require('../diagrams/enclosure_chart/pack_layout_adapter.js'),
    ZoomHandler      = require('../diagrams/enclosure_chart/zoom_handler.js'),
    filters          = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Hotspot analysis',
      description: 'metric vs churn analysis',
      diagramSelectionTitle: 'Metric selection',
      dateRange: manifest.parseDateRange()
    },
    graphModels: [
      { valueProperty: 'sloc', valueLabel: 'Lines of code' },
      { valueProperty: 'totalComplexity', valueLabel: 'Complexity' }
    ].map(function(cfg) {
      return {
        id: 'hotspot-analysis-' + cfg.valueProperty,
        label: cfg.valueLabel,
        dataFile: manifest.dataFiles[0].fileUrl,
        controlTemplates: {
          filters: [
            { name: 'metricRangeFilterTemplate' }, { name: 'percentageRangeFilterTemplate' }
          ]
        },
        viewTemplates: ['elementInfo3TooltipTemplate'],
        diagram:{
          Model: Model,
          layoutAdapter: new LayoutAdapter({ diameter: 950, valueProperty: cfg.valueProperty }),
          graphHandlers: [new ZoomHandler({ diameter: 950 })],
          configuration: {
            style: {
              cssClass: 'circle-packing-diagram',
              width: 960,
              height: 960,
              diameter: 950,
              nodeDepthColorRange: ['hsl(185,60%,99%)', 'hsl(187,40%,70%)'],
              weightedNodeColor: '#990012'
            },
            series: _.extend({}, cfg, { calculatedWeightProperty: 'weight' }),
            tooltipInfo: {
              templateId: 'element-info-3-tooltip',
              templateProperties: [
                { label: cfg.valueLabel, valueProperty: cfg.valueProperty },
                { label: 'Revisions', valueProperty: 'revisions' }
              ]
            }
          },
          filters: {
            valueFilter: {
              instance: new filters.MetricRange(cfg.valueLabel),
              group: 'metricRange',
              dataTransform: function(series) {
                return _.map(_.filter(series, _.method('isLeaf')), 'value');
              }
            },
            weightFilter: {
              instance: new filters.PercentageMetricRange('Churn level %'),
              group: 'percentageRange'
            }
          }
        }
      };
    })
  };
};
