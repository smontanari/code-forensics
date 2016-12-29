/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function(task) {
  this.run = function(argsArray) {
    if (_.isFunction(task.taskFunction)) {
      return task.taskFunction.apply(null, _.toArray(argsArray));
    }
  };
};
