/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    objectTransformer = require('./object_transformer');

module.exports = {
  extension: function(transformOption) {
    return function(reportItem, dataSourceItem) {
      _.extend(reportItem, objectTransformer(dataSourceItem, transformOption));
    };
  }
};
