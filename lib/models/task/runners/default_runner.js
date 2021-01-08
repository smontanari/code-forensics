/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');


module.exports = function(task) {
  var doNothing = function(done) { done(); };

  if (_.isFunction(task.run)) {
    this.run = task.run;
  } else {
    this.run = doNothing;
  }
};
