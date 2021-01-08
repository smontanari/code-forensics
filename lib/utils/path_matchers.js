/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  haveSamePath: function(item1, item2) {
    return item1.path === item2.path;
  },
  isCoupledWith: function(targetPath, item) {
    return item.path === targetPath || item.coupledPath === targetPath;
  },
  areCoupled: function(item1, item2) {
    return item1.path === item2.path || item1.path.match(item2.coupledPath);
  },
  areCoupledWith: function(targetPath, item1, item2) {
    return (item1.path.match(item2.coupledPath) && targetPath === item2.path) ||
           (item1.path.match(item2.path) && targetPath === item2.coupledPath);
  }
};
