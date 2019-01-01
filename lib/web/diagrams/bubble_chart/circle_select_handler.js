/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var allNodes = mainChart
      .getComponentByName('node-data')
      .getElement()
      .selectAll('circle');

    allNodes.on('click', function(node) {
      model.selectNode(node);
      mainChart.updateComponents();
      d3.event.stopPropagation();
    });
  };
};
