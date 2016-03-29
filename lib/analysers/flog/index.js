var Analyser = require('./analyser'),
    Parser   = require('./parser');

module.exports = {
  analyser: new Analyser(new Parser()),
  fileAnalysisStream: function(filepath) {
    return module.exports.analyser.fileStreamAnalysis(filepath);
  },
  contentAnalysisStream: function() {
    return module.exports.analyser.contentStreamAnalysis();
  }
};
