var _           = require('lodash'),
    multistream = require('multistream'),
    map         = require('through2-map'),
    flog        = require('../../analysers/flog'),
    utils       = require('../../utils'),
    pp          = require('../../parallel_processing');

const TASKNAME = 'ruby-complexity-analysis';

module.exports = function(context, taskDef) {
  taskDef.add(TASKNAME, 'Report the computed complexity for each ruby file', function() {
    return pp.objectStreamCollector(context.jobRunner)
    .mergeStream(utils.functions.arrayToFnFactory(context.repository.collectCodePaths('ruby'), function(filepath) {
      return flog.analyser.fileAnalysisStream(filepath);
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.codeComplexity('ruby')));
  });
  return TASKNAME;
};
