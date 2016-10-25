var filter   = require('through2-filter'),
    codeMaat = require('../../analysers/code_maat');

module.exports = function(context) {
  this.reportStream = function(analyser, vcslog, codeMaatOptions) {
    return codeMaat[analyser].fileAnalysisStream(vcslog, codeMaatOptions)
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
  };
};
