/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(config, seriesGroups, diagramScale, colorScale) {
  this.dataDefinitions = _.map(seriesGroups, function(namedSeries) {
    return {
      name: 'dots-' + namedSeries.name,
      componentType: 'data',
      properties: {
        offset: { x: config.style.margin.left,  y: config.style.margin.top },
        attributes: { class: 'dots' }
      },
      series: namedSeries.allValues(),
      graphicElements: [
        {
          elementType: 'circle',
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
              style: { color: colorScale(namedSeries.name) },
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

  this.updateStrategyDefinitions = _.map(seriesGroups, function(namedSeries) {
    return {
      name: 'dots-' + namedSeries.name,
      method: 'repaint',
      parameters: [
        {
          elementSelection: 'circle',
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
