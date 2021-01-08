/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  selector: function(obj) {
    return {
      coupledName: obj.coupledPath,
      couplingDegree: obj.couplingDegree
    };
  }
};
