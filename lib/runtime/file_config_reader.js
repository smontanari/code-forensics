/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path          = require('path'),
    fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../utils');

module.exports = function() {
  var file = Path.resolve('.code-forensics');
  var decoder = new StringDecoder();

  this.getConfiguration = function() {
    if (utils.fileSystem.isFile(file)) {
      return JSON.parse(decoder.write(fs.readFileSync(file)));
    }
    return {};
  };
};
