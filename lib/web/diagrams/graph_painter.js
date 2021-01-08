/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var D3Chart = require('../d3_chart_components/d3_chart.js');

module.exports = function(svgContainerSelector, graphHandlers) {
  var self = this;
  this.charts = [];

  this.draw = function(model) {
    this.charts = _.map(model.chartDefinitions, function(definition) {
      return new D3Chart(svgContainerSelector, definition);
    });

    if (_.isFunction(model.onModelChange)) {
      model.onModelChange(function() { _.invokeMap(self.charts, 'updateComponents'); });
    }

    _.each(graphHandlers, function(handler) {
      handler.bindTo(self.charts, model);
    });
  };
};
