/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  metricCollector: function(obj) {
    return {
      coupledName: obj.coupledPath,
      couplingDegree: obj.couplingDegree,
    };
  }
};
