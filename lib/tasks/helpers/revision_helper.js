/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var moment = require('moment'),
    _      = require('lodash'),
    pp     = require('../../parallel_processing'),
    map    = require('through2-map'),
    vcs    = require('../../vcs');

module.exports = function(context) {
  var vcsClient = vcs.client(context.repository);

  this.revisionAnalysisStream = function(analyser) {
    var file = context.parameters.targetFile;
    var moduleRevisions = vcsClient.revisions(file, context.dateRange);

    if (moduleRevisions.length === 0) { throw new Error('No revisions data found'); }

    return pp.streamProcessor().mergeAll(moduleRevisions, function(revisionObj) {
      return vcsClient.showRevisionStream(revisionObj.revisionId, file)
        .pipe(analyser.sourceAnalysisStream(file))
        .pipe(map.obj(function(analysisResult) {
          return _.extend({ revision: revisionObj.revisionId, date: moment(revisionObj.date) }, analysisResult);
        }));
    });
  };
};
