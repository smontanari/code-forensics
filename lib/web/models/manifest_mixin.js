/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = {
  getReportUrl: function() {
    return '?reportId=' + this.id;
  },
  parseDateRange: function() {
    var dates = this.dateRange.split('_');
    return { from: dates[0], to: dates[1] };
  },
  selectAvailableGraphs: function(graphs) {
    var enabledDiagrams = this.enabledDiagrams;
    return _.filter(graphs, function(g) {
      return _.includes(enabledDiagrams, g.diagramName);
    });
  },
  hasLayers: function() {
    return _.has(this.parameters, 'layerGroup');
  }
};
