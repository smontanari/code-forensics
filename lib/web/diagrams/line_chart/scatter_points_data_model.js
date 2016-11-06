var _  = require('lodash');
var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(config, series, diagramScale, colorScale) {
  this.dataDefinitions = _.map(series, function(namedSeries) {
    return {
      key: 'dots-' + namedSeries.name,
      properties: {
        offset: { x: config.style.margin.left,  y: config.style.margin.top },
        attributes: { class: 'dots' }
      },
      series: namedSeries.values,
      graphicElements: [
        {
          type: 'circle',
          properties: {
            attributes: {
              r: 3,
              cx: function(d) { return diagramScale.x(d[config.plotLine.scatterPoints.valueProperty.x]); },
              cy: function(d) { return diagramScale.y(d[config.plotLine.scatterPoints.valueProperty.y]); },
              'clip-path': 'url(#clip)'
            },
            style: { fill: colorScale(namedSeries.name) }
          },
          tooltip: {
            properties: {
              attributes: { class: 'd3-tip line-chart-diagram' },
              style: { color: colorScale(namedSeries.name)},
              html: function(d) {
                return mustacheHelper.renderTemplate.apply(null, [
                  config.tooltipInfo.templateId,
                  {
                    title: namedSeries.name,
                    data: _.map(config.tooltipInfo.templateProperties, function(prop) {
                      return {
                        label: prop.label,
                        value: (prop.transform || _.identity)(d[prop.valueProperty])
                      };
                    })
                  }
                ]);
              }
            },
            actions: {
              show: { event: 'mouseover' }, hide: { event: 'mouseout' }
            }
          }
        }
      ]
    };
  });

  this.UpdateStrategyDefinitions = _.map(series, function(namedSeries) {
    return {
      key: 'dots-' + namedSeries.name,
      method: 'repaintData',
      arguments: [
        {
          type: 'circle',
          properties: {
            attributes: {
              cx: function(d) { return diagramScale.x(d[config.plotLine.scatterPoints.valueProperty.x]); },
              cy: function(d) { return diagramScale.y(d[config.plotLine.scatterPoints.valueProperty.y]); },
              'clip-path': 'url(#clip)'
            }
          }
        }
      ]
    };
  });
};
