/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Bluebird = require('bluebird');

module.exports = function(graphModels) {
  this.selectGraph = function(graphModel) {
    _.each(graphModels, function(g) {
      g.isSelected(g.id === graphModel.id);
    });
  };

  Bluebird.all(_.invokeMap(_.invokeMap(graphModels, 'initialize'), 'reflect'))
    .then(function(promises) {
      var selectionIndex;
      _.each(promises, function(p, index) {
        if (selectionIndex === undefined && p.isFulfilled()) {
          selectionIndex = index;
        } else if (p.isRejected()) {
          //eslint-disable-next-line no-console
          console.error('Graph initialization error [' + graphModels[index].id + ']', '-', p.reason());
        }
      });
      graphModels[selectionIndex || 0].isSelected(true);
    });
};
