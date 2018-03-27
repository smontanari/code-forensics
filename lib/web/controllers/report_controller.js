/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
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

  Bluebird.all(_.map(_.invokeMap(graphModels, 'initialize'), _.method('reflect')))
    .then(function(promises) {
      var index = _.findIndex(promises, _.method('isFulfilled'));
      graphModels[index].isSelected(true);
    });
};
