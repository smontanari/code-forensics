/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    codeMaat = require('../../analysers/code_maat');

module.exports = function() {
  var self = this;

  _.each({
    revisionsAnalysis:        'revisions',
    summaryAnalysis:          'summary',
    sumCouplingAnalysis:      'soc',
    temporalCouplingAnalysis: 'coupling',
    authorsAnalysis:          'authors',
    mainDevAnalysis:          'main-dev',
    effortAnalysis:           'entity-effort',
    codeOwnershipAnalysis:    'entity-ownership',
    communicationAnalysis:    'communication',
    absoluteChurnAnalysis:    'abs-churn',
    entityChurnAnalysis:      'entity-churn'
  }, function(parserInstruction, analysisFn) {
    self[analysisFn] = function(inputLogFile, inputGroupFile, options) {
      return codeMaat.analyser(parserInstruction).fileAnalysisStream(inputLogFile, inputGroupFile, options);
    };
    self[analysisFn].isSupported = function() { return codeMaat.analyser(parserInstruction).isSupported(); };
  });
};
