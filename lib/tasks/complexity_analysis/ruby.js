var flog  = require('../../analysers/flog'),
    utils = require('../../utils'),
    pp    = require('../../parallel_processing');

module.exports = function(context, taskDef) {
  taskDef.add('ruby-complexity-analysis', 'Report the computed complexity for each ruby file', function() {
    return pp.objectStreamCollector(context.jobRunner)
    .mergeAll(utils.functions.arrayToFnFactory(context.repository.collectCodePaths('ruby'), function(filepath) {
      return flog.analyser.fileAnalysisStream(filepath);
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.codeComplexity('ruby')));
  });
};
