/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    glob          = require('glob'),
    Path          = require('path'),
    StringDecoder = require('string_decoder').StringDecoder,
    logger        = require('../log'),
    utils         = require('../utils');

var decoder = new StringDecoder();

module.exports = function(baseDir) {
  return _.reduce(glob.sync(Path.join(baseDir, '*')), function(allStreams, reportDir) {
    var manifestFile = Path.join(reportDir, 'manifest.json');
    if (utils.fileSystem.isFile(manifestFile)) {
      allStreams.push(utils.stream.readFileToObjectStream(manifestFile, function(content) {
        return JSON.parse(decoder.write(content));
      }));
    } else {
      logger.error('Report manifest not found: ' + manifestFile);
    }
    return allStreams;
  }, []);
};
