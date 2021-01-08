/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    escomplex     = require('typhonjs-escomplex'),
    StringDecoder = require('string_decoder').StringDecoder,
    logger        = require('../../log'),
    utils         = require('../../utils'),
    appConfig     = require('../../runtime/app_config');

var decoder = new StringDecoder();

module.exports = function() {
  var parserOptions = appConfig.get('javascriptParser.options');

  var parseMethodComplexity = function(methods, className) {
    var namePrefix = _.isEmpty(className) ? '' : className + '.';
    return _.map(methods, function(fnReport) {
      return {
        name: namePrefix + fnReport.name,
        complexity: fnReport.cyclomatic
      };
    });
  };

  var analyse = function(filepath, content, transformFn, onError) {
    try {
      var report = escomplex.analyzeModule(decoder.write(content), {}, parserOptions);
      var methodComplexityArray = _.concat(
        parseMethodComplexity(report.methods),
        _.flatMap(report.classes, function(clazz) {
          return parseMethodComplexity(clazz.methods, clazz.name);
        })
      );
      var complexityReport = {
        path: filepath,
        totalComplexity: report.aggregate.cyclomatic,
        averageComplexity: report.methodAverage.cyclomatic,
        methodComplexity: methodComplexityArray
      };

      if (_.isFunction(transformFn)) {
        return transformFn(complexityReport);
      }
      return complexityReport;
    } catch(e) {
      onError(e);
    }
  };

  this.sourceAnalysisStream = function(filepath, transformFn) {
    return utils.stream.reduceToObjectStream(function(content) {
      return analyse(filepath, content, transformFn, function(e) {
        logger.error('Error analysing content: ' + e.message);
      });
    });
  };

  this.fileAnalysisStream = function(filepath, transformFn) {
    logger.info('Analysing ', filepath);
    return utils.stream.readFileToObjectStream(filepath, function(content) {
      return analyse(filepath, content, transformFn, function(e) {
        logger.error('Error analysing ' + filepath + ': ' + e.message);
      });
    });
  };
};
