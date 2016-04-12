var _           = require('lodash'),
    multistream = require('multistream'),
    map         = require('through2-map'),
    escomplex   = require('../../analysers/escomplex'),
    json        = require('../../utils/').json;

var TASKNAME = 'javascript-complexity-analysis';

module.exports = function(context, taskDef) {
  taskDef.add(TASKNAME, 'Report the computed complexity for each javascript file', function() {
    return multistream.obj(_.map(context.repository.collectCodePaths('javascript'), function(filepath) {
      return escomplex.analyser.fileAnalysisStream(filepath);
    }))
    .pipe(json.objectArrayToFileStream(context.files.temp.codeComplexity('javascript')));
  });
  return TASKNAME;
};
