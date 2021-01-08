/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash'),
    ko = require('knockout');

module.exports = function(configuration, series) {
  var colorScale = configuration.colorScaleFactory(series);

  var visibleSeries = ko.observable(series);
  var wordDisplay = function(word) {
    return _.includes(visibleSeries(), word) ? 'inline' : 'none';
  };

  this.applyFilters = function(filters) {
    var filterValue = filters.wordOccurenciesFilter.instance.outputValue();
    visibleSeries(_.filter(series, function(word) {
      return word.count >= filterValue;
    }));
  };

  this.onModelChange = function(listener) {
    visibleSeries.subscribe(listener);
  };

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: {
          class: 'word-cloud',
          viewBox: '0 0 ' + configuration.style.width + ' ' + configuration.style.height
        }
      },
      components: [
        {
          name: 'word-data',
          componentType: 'data',
          properties: {
            offset: { x: configuration.style.width / 2, y: configuration.style.height / 2 }
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
                  'font-size': function(d) { return configuration.style.minFontSize + d.size + 'px'; },
                  'fill': function(d, i) { return colorScale(i); },
                  display: wordDisplay
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
                  style: { display: wordDisplay }
                }
              }
            ]
          }
        ]
      }
    }
  ];
};
