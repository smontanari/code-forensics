var SlocAnalyser = require('analysers/sloc/sloc_analyser'),
    logger       = require('log'),
    utils        = require('utils');

var helpers = require('../../jest_helpers');

describe('SlocAnalyser', function() {
  var verifySlocReport = function(methodName) {
    var subject;
    describe('with default mappings', function() {
      beforeEach(function() {
        subject = new SlocAnalyser();
      });

      describe('with a supported file type', function() {
        it('returns a report with the number of lines of code', function() {
          var report = subject[methodName]('test/file.rb');

          expect(report).toEqual({ path: 'test/file.rb', sourceLines: 2, totalLines: 4 });
        });
      });

      describe('with a transform callback function', function() {
        it('returns a report modified by the callback', function() {
          var report = subject[methodName]('test/file.rb',
            function(report) { return { test: 'some value', result: report.sourceLines }; });

          expect(report).toEqual({ test: 'some value', result: 2 });
        });
      });

      describe('with unsupported file types', function() {
        describe('for files with mapped extension', function() {
          it.each([
            ['yml', 2],
            ['erb', 3],
            ['haml', 3],
            ['rake', 2]
          ])('returns a report with the number of lines of code', function(extension, expectedSourceLines) {
            var report = subject[methodName]('test/file.' + extension);

            expect(report).toEqual({ path: 'test/file.' + extension, sourceLines: expectedSourceLines, totalLines: 4 });
          });
        });

        describe('for files with mapped basename', function() {
          it.each([
            ['Gemfile', 2],
            ['Rakefile', 2]
          ])('returns a report with the number of lines of code', function(basename, expectedSourceLines) {
            var report = subject[methodName](basename);

            expect(report).toEqual({ path: basename, sourceLines: expectedSourceLines, totalLines: 4 });
          });
        });

        describe('for all other files', function() {
          it('does not return a report', function() {
            subject[methodName]('test/file.txt');

            expect(logger.warn).toHaveBeenCalledWith('File extension not supported by sloc: test/file.txt');
          });
        });
      });
    });

    describe('with custom mappings and overrides', function() {
      beforeEach(function() {
        helpers.appConfigStub({
          sloc: {
            basenameMapping: {
              'test-custom-file1': 'rb',
              'test-custom-file2.erb': 'rb'
            },
            extensionMapping: {
              '.test1': 'rb',
              '.rake': 'html'
            }
          }
        });
        subject = new SlocAnalyser();
      });

      afterEach(function() {
        helpers.appConfigRestore();
      });

      it.each([
        ['test/test-custom-file1', 2],
        ['test/file.erb', 3],
        ['test/test-custom-file2.erb', 2],
        ['test/file.test1', 2],
        ['test/file.rake', 3]
      ])('returns a report with the number of lines of code', function(filepath, expectedSourceLines) {
        var report = subject[methodName](filepath);

        expect(report).toEqual({ path: filepath, sourceLines: expectedSourceLines, totalLines: 4 });
      });
    });
  };

  describe('.fileAnalysis()', function() {
    beforeEach(function() {
      utils.stream.readFileToObjectStream = jest.fn()
        .mockImplementation(function(_file, cb) {
          return cb('line1\n#line2\n\nline3');
        });
    });
    verifySlocReport('fileAnalysisStream');
  });

  describe('.sourceAnalysis()', function() {
    beforeEach(function() {
      utils.stream.reduceToObjectStream = jest.fn()
        .mockImplementation(function(cb) {
          return cb('line1\n#line2\n\nline3');
        });
    });

    verifySlocReport('sourceAnalysisStream');
  });
});
