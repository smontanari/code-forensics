var escomplex = require_src('analysers/escomplex'),
    utils     = require_src('utils');

describe('escomplex', function() {
  beforeEach(function() {
    escomplex.analyser = jasmine.createSpyObj('analyser', ['fileAnalysis', 'stringAnalysis']);
  });

  describe('.fileAnalysisStream()', function() {
    it('returns an object stream with the file analysis report', function() {
      spyOn(utils.stream, 'readFileToObjectStream').and.callFake(function(path, callback) {
        callback('test content');
        return 'test-object-stream';
      });

      var output = escomplex.fileAnalysisStream('test/file');

      expect(output).toEqual('test-object-stream');
      expect(utils.stream.readFileToObjectStream).toHaveBeenCalledWith('test/file', jasmine.any(Function));
      expect(escomplex.analyser.fileAnalysis).toHaveBeenCalledWith({ path: 'test/file', contents: 'test content' });
    });
  });

  describe('.contentAnalysisStream()', function() {
    it('returns an object stream with the content analysis report', function() {
      spyOn(utils.stream, 'reduceToObjectStream').and.callFake(function(callback) {
        return { objStream: callback('test content') };
      });
      escomplex.analyser.stringAnalysis.and.returnValue('complexity report');

      var output = escomplex.contentAnalysisStream();

      expect(output).toEqual({objStream: 'complexity report'});
      expect(escomplex.analyser.stringAnalysis).toHaveBeenCalledWith('test content');
    });
  });
});
