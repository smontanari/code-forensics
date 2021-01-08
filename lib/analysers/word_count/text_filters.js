/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports.createRejectFn = function(blacklistExpressions) {
  return function(text) {
    return _.some((blacklistExpressions || []), function(exp) {
      if (_.isString(exp)) { return exp === text; }
      else if (_.isRegExp(exp)) { return exp.test(text); }
      else if (_.isFunction(exp)) { return exp.call(null, text); }
    });
  };
};
