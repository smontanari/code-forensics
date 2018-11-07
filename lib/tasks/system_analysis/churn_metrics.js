/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = {
  selector: function(obj) {
    return {
      addedLines: obj.addedLines,
      deletedLines: obj.deletedLines,
      totalLines: obj.addedLines - obj.deletedLines
    };
  },
  defaultValue: { addedLines: 0, deletedLines: 0, totalLines: 0 },
  accumulatorsMap: { cumulativeLines: _.property('totalLines') }
};
