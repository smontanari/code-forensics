var moment = require('moment'),
    _      = require('lodash'),
    map    = require("through2-map"),
    utils  = require('../../utils'),
    vcsSupport    = require('../../vcs_support'),
    pp     = require('../../parallel_processing');

module.exports = function(repository, jobRunner) {
  var gitRepo = new vcsSupport.Git(repository.root);

  this.revisionAnalysisStream = function(file, dateRange, analyserFn) {
    var moduleRevisions = gitRepo.revisions(file, dateRange);

    return pp.objectStreamCollector(jobRunner)
    .mergeAll(utils.functions.arrayToFnFactory(moduleRevisions, function(revisionObj) {
      return gitRepo.showRevisionStream(revisionObj.revisionId, file)
      .pipe(analyserFn())
      .pipe(map.obj(function(analysisResult) {
        return _.extend({revision: revisionObj.revisionId, date: moment(revisionObj.date)}, analysisResult);
      }));
    }));
  };
};
