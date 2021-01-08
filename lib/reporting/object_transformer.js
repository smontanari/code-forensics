/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function(obj, option) {
  if (_.isFunction(option)) { return option(obj); }
  if (_.isString(option) || _.isArray(option)) { return _.pick(obj, option); }
  return obj;
};
