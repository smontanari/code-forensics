var stream    = require('stream'),
    fs        = require('fs'),
    escomplex = require('escomplex');

var ESComplexAnalyser = require_src('analysers/escomplex/escomplex_analyser'),
    Parser            = require_src('analysers/escomplex/parser');

describe('ESComplexAnalyser', function() {
  beforeEach(function() {
    this.appConfigStub({
      javascriptParser: {
        module: 'testParser', options: { a: 123, b: 456 }
      }
    });

    spyOn(Parser, 'create').and.returnValue('TestParser');
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

    describe('without any transform callback function', function() {
      it('reports the complexity of the file content', function(done) {
        var report;
        this.subject.fileAnalysisStream('test/file.js')
        .on('data', function(output) {
          report = output;
        })
        .on('end', function(){
          expect(report).toEqual({
            path: 'test/file.js',
            totalComplexity: 123,
            averageComplexity: 622.5,
            methodComplexity: [
              { name: 'fn1', complexity: 456 },
              { name: 'fn2', complexity: 789 }
            ]
          });
          expect(escomplex.analyse).toHaveBeenCalledWith('test content', jasmine.any(Object), 'TestParser');
          expect(fs.readFile).toHaveBeenCalledWith('test/file.js', jasmine.any(Function));
          done();
        });
      });
    });

    describe('with a transform callback function', function() {
      it('returns the complexity report of the file content modified by the transform callback', function(done) {
        var report;
        this.subject.fileAnalysisStream('test/file.js', function(report) { return { test: 'some value', result: report.totalComplexity }; })
        .on('data', function(output) {
          report = output;
        })
        .on('end', function(){
          expect(report).toEqual({
            test: 'some value',
            result: 123
          });
          expect(escomplex.analyse).toHaveBeenCalledWith('test content', jasmine.any(Object), 'TestParser');
          expect(fs.readFile).toHaveBeenCalledWith('test/file.js', jasmine.any(Function));
          done();
        });
      });
    });
  });

  describe('.sourceAnalysisStream()', function() {
    describe('without any transform callback function', function() {
      it('reports the complexity of the source content', function(done) {
        var report;
        var inputStream = new stream.PassThrough();

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.js'))
        .on('data', function(output) {
          report = output;
        })
        .on('end', function() {
          expect(report).toEqual({
            path: 'test/file.js',
            totalComplexity: 123,
            averageComplexity: 622.5,
            methodComplexity: [
              { name: 'fn1', complexity: 456 },
              { name: 'fn2', complexity: 789 }
            ]
          });
          expect(escomplex.analyse).toHaveBeenCalledWith('test content', jasmine.any(Object), 'TestParser');
          done();
        });

        inputStream.write('test content');
        inputStream.end();
      });
    });

     describe('with a transform callback function', function() {
      it('returns the complexity report of the source content modified by the transform callback', function(done) {
        var report;
        var inputStream = new stream.PassThrough();

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.js', function(report) { return { test: 'some value', result: report.totalComplexity }; }))
        .on('data', function(output) {
          report = output;
        })
        .on('end', function() {
          expect(report).toEqual({
            test: 'some value',
            result: 123
          });
          expect(escomplex.analyse).toHaveBeenCalledWith('test content', jasmine.any(Object), 'TestParser');
          done();
        });

        inputStream.write('test content');
        inputStream.end();
      });
    });
  });
});
