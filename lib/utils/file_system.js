/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var fs = require('fs'),
    _  = require('lodash'),
    Q  = require('q');

var queryEntity = function(queryFn, path) {
  return fs.existsSync(path) && fs.statSync(path)[queryFn]();
};

module.exports = {
  isFile:      _.wrap('isFile', queryEntity),
  isDirectory: _.wrap('isDirectory', queryEntity),
  writeToFile: function(filepath, content) {
    return Q.nfcall(fs.writeFile, filepath, content);
  }
};
