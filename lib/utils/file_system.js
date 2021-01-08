/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var fs       = require('fs'),
    _        = require('lodash'),
    Bluebird = require('bluebird');

var queryEntity = function(queryFn, path) {
  return fs.existsSync(path) && fs.statSync(path)[queryFn]();
};

module.exports = {
  isFile:      _.wrap('isFile', queryEntity),
  isDirectory: _.wrap('isDirectory', queryEntity),
  writeToFile: Bluebird.promisify(fs.writeFile)
};
