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
        var report;

        this.subject.fileAnalysisStream('test/file.rb')
        .on('data', function(output) {
          report = output;
        })
        .on('end', function() {
          expect(report).toEqual({ path: 'test/file.rb', sloc: 2 });
          expect(fs.readFile).toHaveBeenCalledWith('test/file.rb', jasmine.any(Function));
          done();
        });
      });
    });

    describe('with a transform callback function', function() {
      it('returns a report modified by the callback', function(done) {
        var report;

        this.subject.fileAnalysisStream('test/file.rb', function(report) { return { test: 'some value', result: report.sloc }; })
        .on('data', function(output) {
          report = output;
        })
        .on('end', function() {
          expect(report).toEqual({ test: 'some value', result: 2 });
          expect(fs.readFile).toHaveBeenCalledWith('test/file.rb', jasmine.any(Function));
          done();
        });
      });
    });

    describe('with an unsupported file type', function() {
      it('does not return a report', function(done) {
        this.subject.fileAnalysisStream('test/file.txt')
        .on('data', function() {
          fail('the stream has data when it should not');
        })
        .on('end', function() {
          expect(fs.readFile).toHaveBeenCalledWith('test/file.txt', jasmine.any(Function));
          done();
        });
      });
    });
  });

  describe('.sourceAnalysis()', function() {
    describe('with a supported file type', function() {
      it('returns a report with the number of lines of code', function(done) {
        var inputStream = new stream.PassThrough();
        var report;

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.rb'))
        .on('data', function(output) {
          report = output;
        })
        .on('end', function() {
          expect(report).toEqual({ path: 'test/file.rb', sloc: 2 });
          done();
        });

        inputStream.write("line1\nline2");
        inputStream.end();
      });
    });

    describe('with a transform callback function', function() {
      it('returns a report modified by the callback', function(done) {
        var inputStream = new stream.PassThrough();
        var report;

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.rb', function(report) { return { test: 'some value', result: report.sloc }; }))
        .on('data', function(output) {
          report = output;
        })
        .on('end', function() {
          expect(report).toEqual({ test: 'some value', result: 2 });
          done();
        });

        inputStream.write("line1\nline2");
        inputStream.end();
      });
    });

    describe('with a unsupported file type', function() {
      it('does not return a report', function(done) {
        var inputStream = new stream.PassThrough();

        inputStream.pipe(this.subject.sourceAnalysisStream('test/file.txt'))
        .on('data', function() {
          fail('the stream has data when it should not');
        })
        .on('end', done);

        inputStream.write("line1\nline2");
        inputStream.end();
      });
    });
  });
});
