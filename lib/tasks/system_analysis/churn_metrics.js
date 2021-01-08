/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var ZERO_VALUE = { addedLines: 0, deletedLines: 0, totalLines: 0 };

module.exports = {
  selector: function(obj) {
    if (isNaN(obj.addedLines) || isNaN(obj.deletedLines)) {
      return ZERO_VALUE;
    }
    return {
      addedLines: obj.addedLines,
      deletedLines: obj.deletedLines,
      totalLines: obj.addedLines - obj.deletedLines
    };
  },
  defaultValue: ZERO_VALUE,
  accumulatorsMap: { cumulativeLines: _.property('totalLines') }
};
