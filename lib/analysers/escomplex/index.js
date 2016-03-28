var StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../../utils'),
    Analyser      = require('./analyser');

var decoder = new StringDecoder();

module.exports = {
  analyser: new Analyser(),
  fileAnalysisStream: function(path) {
    return utils.stream.readFileToObjectStream(path, function(data) {
      return module.exports.analyser.fileAnalysis({ path: path, contents: data });
    });
  },
  contentAnalysisStream: function() {
    return utils.stream.reduceToObjectStream(function(data) {
      return module.exports.analyser.stringAnalysis(decoder.write(data));
    });
  }
};
