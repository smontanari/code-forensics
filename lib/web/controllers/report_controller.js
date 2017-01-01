/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash'),
    Q = require('q');

module.exports = function(graphModels) {
  this.selectGraph = function(graphModel) {
    _.each(graphModels, function(g) {
      g.isSelected(g.id === graphModel.id);
    });
  };

  Q.allSettled(_.invokeMap(graphModels, 'initialize')).then(function() {
    graphModels[0].isSelected(true);
  });
};
