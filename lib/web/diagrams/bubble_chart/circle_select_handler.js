/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var allNodes = mainChart
      .getComponentByName('node-data')
      .getElement()
      .selectAll('circle');

    allNodes.on('click', function(event, node) {
      model.selectNode(node);
      mainChart.updateComponents();
      event.stopPropagation();
    });
  };
};
