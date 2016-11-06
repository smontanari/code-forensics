var _ = require('lodash');

module.exports = function(config, legendKeys, colorScale) {
  var actualWidth = config.style.width - config.style.margin.left - config.style.margin.right,
      actualHeight = config.style.height - config.style.margin.top - config.style.margin.bottom;

  var elementsOffset = function(d, i) { return { x: 30, y: i * 15 }; };

  this.legendDefinition = {
    key: 'legend',
    properties: {
      offset: { x: config.style.margin.left,  y: config.style.margin.top },
      attributes: { class: 'legend' }
    },
    series: legendKeys,
    graphicElements: [
      {
        type: 'circle',
        properties: {
          offset: elementsOffset,
          attributes: {
            r: 5,
            cx: actualWidth + 30,
            cy: 9
          },
          style: { fill: colorScale }
        }
      },
      {
        type: 'text',
        properties: {
          offset: elementsOffset,
          attributes: {
            x: actualWidth + 20,
            y: 9,
            dy: '.35em',
          },
          text: _.identity
        }
      }
    ]
  };
};
