var _ = require('lodash');

var Model             = require('../diagrams/enclosure_chart/colored_diagram_model.js'),
    LayoutAdapter     = require('../diagrams/enclosure_chart/pack_layout_adapter.js'),
    ZoomHandler       = require('../diagrams/enclosure_chart/zoom_handler.js'),
    ColorScaleFactory = require('../utils/color_scale_factory.js'),
    filters           = require('../filters/index.js');

module.exports = function(manifest) {
  return {
    metadata: {
      title: 'Knowledge Map analysis',
      description: 'Knowledge distribution between developers/teams',
      diagramSelectionTitle: 'View',
      dateRange: manifest.parseDateRange()
    },
    graphModels: _.map([
      {
        id: 'knowledge-map-developer',
        label: 'Developers',
        colorProperty: 'mainDev'
      },
      {
        id: 'knowledge-map-team',
        label: 'Teams',
        colorProperty: 'team'
      }
    ], function(attributes) {
      return {
        id: attributes.id,
        label: attributes.label,
        dataFile: manifest.dataFiles[0],
        controlTemplates: {
          filters: [
            { name: 'metricRangeFilterTemplate', data: { labels: ['Lines of code'] } },
            { name: 'colorMapFilterTemplate', data: { labels: [attributes.label] } }
          ]
        },
        viewTemplates: ['elementInfo3TooltipTemplate'],
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
            colorScaleFactory: function(series) {
              return ColorScaleFactory.sequentialRainbow(series);
            },
            series: { valueProperty: 'sloc', colorProperty: attributes.colorProperty },
            tooltipInfo: {
              templateId: 'element-info-3-tooltip',
              templateProperties: [
                { label: 'Developer', valueProperty: 'mainDev' },
                { label: 'Team', valueProperty: 'team' },
                { label: 'Ownership', valueProperty: 'ownership' },
                { label: 'Added lines', valueProperty: 'addedLines' }
              ]
            }
          },
          controls: {
            filters: {
              valueFilter: {
                instance: new filters.MetricRange(),
                group: 'metricRange',
                dataTransform: function(series) {
                  return _.map(_.filter(series, _.method('isLeaf')), 'data.sloc');
                }
              },
              colorFilter: {
                instance: new filters.ColorRange(ColorScaleFactory.sequentialRainbow),
                group: 'colorRange',
                dataTransform: function(series) {
                  return _.uniqBy(
                    _.map(_.filter(series, _.method('isLeaf')), 'data.' + attributes.colorProperty)
                  );
                }
              }
            },
          },
          dataTransform: function(series) {
            var validData = _.some(series, function(node) {
              return node.isLeaf() && _.isString(node.data[attributes.colorProperty]);
            });
            if (validData) {
              return _.filter(series, function(node) {
                return !node.isLeaf() || _.isString(node.data[attributes.colorProperty]);
              });
            }
          }
        }
      };
    })
  };
};
