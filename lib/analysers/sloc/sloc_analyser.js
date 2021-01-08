/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path          = require('path'),
    _             = require('lodash'),
    sloc          = require('sloc'),
    StringDecoder = require('string_decoder').StringDecoder,
    logger        = require('../../log'),
    utils         = require('../../utils'),
    appConfig     = require('../../runtime/app_config');

var FILE_EXTENSION_MAPPING = {
  '.yml':      'yaml',
  '.erb':      'html',
  '.haml':     'html',
  '.rake':     'rb'
};

var FILE_BASENAME_MAPPING = {
  'Rakefile': 'rb',
  'Gemfile': 'rb'
};

var decoder = new StringDecoder();

module.exports = function() {
  var basenameMappings = _.assign({}, FILE_BASENAME_MAPPING, appConfig.get('sloc.basenameMapping'));
  var extensionMappings = _.assign({}, FILE_EXTENSION_MAPPING, appConfig.get('sloc.extensionMapping'));

  var getExtension = function(path) {
    var basename = Path.basename(path);
    var ext = Path.extname(path);
    return basenameMappings[basename] || extensionMappings[ext] || ext.substring(1);
  };

  var analyse = function(filepath, content, transformFn, onError) {
    var ext = getExtension(filepath);
    if (_.includes(sloc.extensions, ext)) {
      var source = decoder.write(content);
      try {
        var stats = sloc(source, ext);
        var report = { path: filepath, sourceLines: stats.source, totalLines: stats.total };

        if (_.isFunction(transformFn)) {
          return transformFn(report);
        }
        return report;
      } catch (e) {
        onError(e);
      }
    } else {
      logger.warn('File extension not supported by sloc: ' + filepath);
    }
  };

  this.sourceAnalysisStream = function(filepath, transformFn) {
    return utils.stream.reduceToObjectStream(function(content) {
      return analyse(filepath, content, transformFn, function(e) {
        logger.error('Error analysing content: ' + e.message);
      });
    });
  };

  this.fileAnalysisStream = function(filepath, reportTransform) {
    logger.info('Analysing ', filepath);
    return utils.stream.readFileToObjectStream(filepath, function(content) {
      return analyse(filepath, content, reportTransform, function(e) {
        logger.error('Error analysing ' + filepath + ': ' + e.message);
      });
    });
  };
};
