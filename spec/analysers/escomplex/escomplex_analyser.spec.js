var stream    = require('stream'),
    fs        = require('fs'),
    escomplex = require('escomplex/src/core');

var ESComplexAnalyser = require_src('analysers/escomplex/escomplex_analyser'),
    Parser            = require_src('analysers/escomplex/parser');

describe('ESComplexAnalyser', function() {
  var mockParser;

  beforeEach(function() {
    mockParser = jasmine.createSpyObj('parser', ['parse']);
    mockParser.parse.and.returnValue('test abstract syntax tree');
    spyOn(Parser, 'create').and.returnValue(mockParser);
    spyOn(escomplex, 'analyse').and.returnValue({
      aggregate: { cyclomatic: 123 },
      functions: [
        { name: 'fn1', cyclomatic: 456 },
        { name: 'fn2', cyclomatic: 789 }
      ]
    });
    this.subject = new ESComplexAnalyser();
  });

  describe('.fileAnalysisStream()', function() {
    beforeEach(function() {
      spyOn(fs, 'readFile').and.callFake(function(path, callback) {
        callback(null, "test content");
      });
    });

    it('reports the complexity of the file content', function(done) {
      this.subject.fileAnalysisStream('test/file.js')
      .on('data', function(report) {
        expect(report).toEqual({
          path: 'test/file.js',
          totalComplexity: 123,
          averageComplexity: 622.5,
          methodComplexity: [
            { name: 'fn1', complexity: 456 },
            { name: 'fn2', complexity: 789 }
          ]
        });
      })
      .on('end', function(){
        expect(mockParser.parse).toHaveBeenCalledWith('test content');
        expect(escomplex.analyse).toHaveBeenCalledWith('test abstract syntax tree', jasmine.any(Object), jasmine.any(Object));
        expect(fs.readFile).toHaveBeenCalledWith('test/file.js', jasmine.any(Function));
        done();
      });
    });
  });

  describe('.sourceAnalysisStream()', function() {
    it('reports the complexity of the source content', function(done) {
      var inputStream = new stream.PassThrough();

      inputStream.pipe(this.subject.sourceAnalysisStream('test/file.js'))
      .on('data', function(report) {
        expect(report).toEqual({
          path: 'test/file.js',
          totalComplexity: 123,
          averageComplexity: 622.5,
          methodComplexity: [
            { name: 'fn1', complexity: 456 },
            { name: 'fn2', complexity: 789 }
          ]
        });
      })
      .on('end', function() {
        expect(escomplex.analyse).toHaveBeenCalledWith('test abstract syntax tree', jasmine.any(Object), jasmine.any(Object));
        done();
      });

      inputStream.write('test content');
      inputStream.end();
    });
  });
});
