/*global require_src*/
var _ = require('lodash');

var SlocAnalyser = require_src('analysers/sloc/sloc_analyser'),
    logger       = require_src('log').Logger,
    utils        = require_src('utils');

describe('SlocAnalyser', function() {
  var verifySlocReport = function(methodName) {
    describe('with default mappings', function() {
      beforeEach(function() {
        this.subject = new SlocAnalyser();
      });

      describe('with a supported file type', function() {
        it('returns a report with the number of lines of code', function() {
          var report = this.subject[methodName]('test/file.rb');

          expect(report).toEqual({ path: 'test/file.rb', sourceLines: 2, totalLines: 4 });
        });
      });

      describe('with a transform callback function', function() {
        it('returns a report modified by the callback', function() {
          var report = this.subject[methodName]('test/file.rb',
            function(report) { return { test: 'some value', result: report.sourceLines }; });

          expect(report).toEqual({ test: 'some value', result: 2 });
        });
      });

      describe('with unsupported file types', function() {
        describe('for files with mapped extension', function() {
          _.each([
            { extension: 'yml', expectedSourceLines: 2 },
            { extension: 'erb', expectedSourceLines: 3 },
            { extension: 'haml', expectedSourceLines: 3 },
            { extension: 'rake', expectedSourceLines: 2 }
         ], function(test) {
            it('returns a report with the number of lines of code', function() {
              var report = this.subject[methodName]('test/file.' + test.extension);

              expect(report).toEqual({ path: 'test/file.' + test.extension, sourceLines: test.expectedSourceLines, totalLines: 4 });
            });
         });
        });

        describe('for files with mapped basename', function() {
          _.each([
            { basename: 'Gemfile', expectedSourceLines: 2 },
            { basename: 'Rakefile', expectedSourceLines: 2 }
          ], function(test) {
            it('returns a report with the number of lines of code', function() {
              var report = this.subject[methodName](test.basename);

              expect(report).toEqual({ path: test.basename, sourceLines: test.expectedSourceLines, totalLines: 4 });
            });
          });
        });

        describe('for all other files', function() {
          it('does not return a report', function() {
            this.subject[methodName]('test/file.txt');

            expect(logger.warn).toHaveBeenCalledWith('File extension not supported by sloc: test/file.txt');
          });
        });
      });
    });

    describe('with custom mappings and overrides', function() {
      beforeEach(function() {
        this.appConfigStub({
          sloc: {
            basenameMapping: {
              'test-custom-file1': 'rb',
              'test-custom-file2.erb': 'rb'
            },
            extensionMapping: {
              '.test1': 'rb',
              '.rake': 'html',
            }
          }
        });
        this.subject = new SlocAnalyser();
      });

      _.each([
        { filepath: 'test/test-custom-file1', expectedSourceLines: 2 },
        { filepath: 'test/file.erb', expectedSourceLines: 3 },
        { filepath: 'test/test-custom-file2.erb', expectedSourceLines: 2 },
        { filepath: 'test/file.test1', expectedSourceLines: 2 },
        { filepath: 'test/file.rake', expectedSourceLines: 3 }
      ], function(test) {
        it('returns a report with the number of lines of code', function() {
          var report = this.subject[methodName](test.filepath);

          expect(report).toEqual({ path: test.filepath, sourceLines: test.expectedSourceLines, totalLines: 4 });
        });
      });
    });
  };

  describe('.fileAnalysis()', function() {
    beforeEach(function() {
      spyOn(utils.stream, 'readFileToObjectStream').and.callFake(function(file, cb) {
        return cb("line1\n#line2\n\nline3");
      });
    });
    verifySlocReport('fileAnalysisStream');
  });

  describe('.sourceAnalysis()', function() {
    beforeEach(function() {
      spyOn(utils.stream, 'reduceToObjectStream').and.callFake(function(cb) {
        return cb("line1\n#line2\n\nline3");
      });
    });

    verifySlocReport('sourceAnalysisStream');
  });
});
