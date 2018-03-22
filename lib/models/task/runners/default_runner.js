/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function(task) {
  this.run = function(done) {
    if (_.isFunction(task.run)) {
      return task.run.call(null, done);
    }
    done();
  };
};
