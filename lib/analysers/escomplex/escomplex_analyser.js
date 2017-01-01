/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    escomplex     = require('escomplex'),
    Parser        = require('./parser'),
    StringDecoder = require('string_decoder').StringDecoder,
    logger        = require('../../log').Logger,
    utils         = require('../../utils'),
    appConfig     = require('../../runtime/app_config');

var decoder = new StringDecoder();

module.exports = function() {
  var jsParser;
  var parserModule = appConfig.get('javascriptParser.module');
  if (parserModule) {
    jsParser = Parser.create(parserModule, appConfig.get('javascriptParser.options'));
  }

  var fnComplexityParser = function(reportFns) {
    return _.map(reportFns, function(fnReport) {
      return {
        name: fnReport.name,
        complexity: fnReport.cyclomatic
      };
    });
  };

  var analyse = function(filepath, content, transformFn, onError) {
    try {
      var report = escomplex.analyse(decoder.write(content), { noCoreSize: true }, jsParser);
      var functionComplexity = fnComplexityParser(report.functions);
      var complexityReport = {
        path: filepath,
        totalComplexity: report.aggregate.cyclomatic,
        averageComplexity: _.mean(_.map(functionComplexity, 'complexity')),
        methodComplexity: functionComplexity
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
