/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(configuration, seriesGroups, diagramScale, colorScale) {
  this.dataDefinitions = _.map(seriesGroups, function(namedSeries) {
    return {
      name: 'dots-' + namedSeries.name,
      componentType: 'data',
      properties: {
        offset: { x: configuration.style.margin.left,  y: configuration.style.margin.top },
        attributes: { class: 'dots' }
      },
      series: namedSeries.allValues(),
      graphicElements: [
        {
          elementType: 'circle',
          properties: {
            attributes: {
              r: 3,
              cx: function(d) { return diagramScale.x(d[configuration.plotLine.scatterPoints.valueProperty.x]); },
              cy: function(d) { return diagramScale.y(d[configuration.plotLine.scatterPoints.valueProperty.y]); },
              'clip-path': 'url(#clip-' + configuration.plotName + ')'
            },
            style: { fill: colorScale(namedSeries.name) }
          },
          tooltip: {
            class: 'line-chart-diagram',
            html: function(_event, d) {
              return mustacheHelper.renderTemplate.apply(null, [
                configuration.tooltipInfo.templateId,
                {
                  name: namedSeries.name,
                  data: _.map(configuration.tooltipInfo.templateProperties, function(prop) {
                    return {
                      label: prop.label,
                      value: (prop.transform || _.identity)(d[prop.valueProperty])
                    };
                  })
                }
              ]);
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
              cx: function(d) { return diagramScale.x(d[configuration.plotLine.scatterPoints.valueProperty.x]); },
              cy: function(d) { return diagramScale.y(d[configuration.plotLine.scatterPoints.valueProperty.y]); },
              'clip-path': 'url(#clip-' + configuration.plotName + ')'
            }
          }
        }
      ]
    };
  });
};
