var stream = require('stream'),
    fs     = require('fs');

var SlocAnalyser = require_src('analysers/sloc/sloc_analyser');

describe('SlocAnalyser', function() {
  beforeEach(function() {
    this.subject = new SlocAnalyser();
  });

  describe('.fileAnalysis()', function() {
    beforeEach(function() {
      spyOn(fs, 'readFile').and.callFake(function(path, callback) {
        callback(null, "line1\nline2");
      });
    });

    describe('with a supported file type', function() {
      it('returns a report with the number of lines of code', function(done) {
        this.subject.fileAnalysisStream('test/file.rb')
        .on('data', function(report) {
          expect(report).toEqual({ path: 'test/file.rb', sloc: 2 });
          expect(fs.readFile).toHaveBeenCalledWith('test/file.rb', jasmine.any(Function));
        })
        .on('end', done);
      });
    });

    describe('with an unsupported file type', function() {
      it('does not return a report', function(done) {
        this.subject.fileAnalysisStream('test/file.txt')
        .on('data', function(report) {
          expect(report).toBeUndefined();
          expect(fs.readFile).toHaveBeenCalledWith('test/file.txt', jasmine.any(Function));
        })
        .on('end', done);
      });
    });
  });

  describe('.sourceAnalysis()', function() {
    describe('with a supported file type', function() {
      it('returns a report with the number of lines of code', function(done) {
        var inputStream = new stream.PassThrough();

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.rb'))
        .on('data', function(report) {
          expect(report).toEqual({ path: 'test/file.rb', sloc: 2 });
        })
        .on('end', done);

        inputStream.write("line1\nline2");
        inputStream.end();
      });
    });

    describe('with a unsupported file type', function() {
      it('does not return a report', function(done) {
        var inputStream = new stream.PassThrough();

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.txt'))
        .on('data', function(report) {
          expect(report).toBeUndefined();
        })
        .on('end', done);

        inputStream.write("line1\nline2");
        inputStream.end();
      });
    });
  });
});
