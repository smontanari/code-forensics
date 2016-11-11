var d3 = require('d3'),
    _  = require('lodash'),
    ko = require('knockout');

module.exports = function(config, series) {
  var self = this;
  var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

  this.seriesValues = _.map(series, 'count');
  this.visibleSeries = ko.observable(series);

  this.updateVisibleSeries = function(filters) {
    var filterValue = filters.wordOccurenciesFilter.outputValue();
    this.visibleSeries(_.filter(series, function(word) {
      return word.count >= filterValue;
    }));
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'word-cloud', width: config.style.width, height: config.style.height }
      },
      components: [
        {
          name: 'word-data',
          componentType: 'data',
          properties: {
            offset: { x: config.style.width / 2, y: config.style.height / 2 }
          },
          series: series,
          graphicElements: [
            {
              elementType: 'text',
              properties: {
                text: function(d) { return d.text; },
                offset: function(d) { return { x: d.x, y: d.y }; },
                rotation: function(d) {  return d.rotate; },
                style: {
                  'font-size': function(d) { return config.style.minFontSize + d.size + 'px'; },
                  'fill': function(d, i) { return colorScale(i); },
                  display: function(word) {
                    return _.includes(self.visibleSeries(), word) ? 'inline' : 'none';
                  }
                }
              }
            }
          ]
        }
      ],
      updateStrategy: {
        components: [
          {
            name: 'word-data',
            method: 'repaint',
            parameters: [
              {
                elementSelection: 'text',
                properties: {
                  style: {
                    display: function(word) {
                      return _.includes(self.visibleSeries(), word) ? 'inline' : 'none';
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ];
};
