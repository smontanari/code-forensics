/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = function(config, series, colorScale) {
  var elementsOffset = function(d, i) { return { x: 10, y: i * 15 }; };

  this.legendDefinition = {
    name: 'legend',
    componentType: 'data',
    properties: {
      offset: { x: config.style.width - config.style.margin.right,  y: config.style.margin.top },
      attributes: { class: 'legend' }
    },
    series: series,
    graphicElements: [
      {
        elementType: 'circle',
        properties: {
          offset: elementsOffset,
          attributes: {
            r: 5,
            cx: 30,
            cy: 9
          },
          style: { fill: colorScale }
        }
      },
      {
        elementType: 'text',
        properties: {
          offset: elementsOffset,
          attributes: {
            x: 20,
            y: 9,
            dy: '.35em'
          },
          text: function(d) { return d.name; }
        }
      }
    ]
  };
};
