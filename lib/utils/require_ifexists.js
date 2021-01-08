/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path = require('path');

module.exports = function(currentPath, modulePath) {
  var path = Path.join(currentPath, modulePath);
  try {
    return require(path);
  } catch(e) {
    if (e instanceof Error && e.code !== 'MODULE_NOT_FOUND') { throw e; }
  }
};
