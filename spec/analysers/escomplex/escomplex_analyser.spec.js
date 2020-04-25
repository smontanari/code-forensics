var stream    = require('stream'),
    fs        = require('fs'),
    Bluebird  = require('bluebird'),
    escomplex = require('typhonjs-escomplex');

var helpers = require('../../jest_helpers');
var ESComplexAnalyser = require('analysers/escomplex/escomplex_analyser');

jest.mock('typhonjs-escomplex');
jest.mock('fs');

describe('ESComplexAnalyser', function() {
  var subject;
  var escomplexReport = {
    aggregate: { cyclomatic: 11 },
    classes: [
      {
        aggregate: { cyclomatic: 5 },
        methods: [
          { cyclomatic: 1, name: 'ma1' },
          { cyclomatic: 6, name: 'ma2' }
        ],
        methodAverage: { cyclomatic: 3.5 },
        name: 'A'
      },
      {
        aggregate: { cyclomatic: 3 },
        methods: [
          { cyclomatic: 2, name: 'mb1' },
          { cyclomatic: 3, name: 'mb2' },
          { cyclomatic: 4, name: 'mb3' }
        ],
        methodAverage: { cyclomatic: 3 },
        name: 'B'
      }
    ],
    methods: [
      { cyclomatic: 3, name: 'fn1' },
      { cyclomatic: 5, name: 'fn2' }
    ],
    methodAverage: { cyclomatic: 3.429 }
  };

  beforeEach(function() {
    helpers.appConfigStub({
      javascriptParser: {
        options: { a: 'optionA', b: 'optionB' }
      }
    });

    escomplex.analyzeModule.mockReturnValue(escomplexReport);
    subject = new ESComplexAnalyser();
  });

  afterEach(function() {
    helpers.appConfigRestore();
  });

  describe('.fileAnalysisStream()', function() {
    beforeEach(function() {
      fs.readFile = jest.fn().mockImplementation(function(_, callback) {
        callback(null, 'test content');
      });
    });

    describe('without any transform callback function', function() {
      it('reports the complexity of the file content', function() {
        return new Bluebird(function(done) {
          var report;
          subject.fileAnalysisStream('test/file.js')
          .on('data', function(output) {
            report = output;
          })
          .on('end', function(){
            expect(report).toEqual({
              path: 'test/file.js',
              totalComplexity: 11,
              averageComplexity: 3.429,
              methodComplexity: [
                { name: 'fn1', complexity: 3 },
                { name: 'fn2', complexity: 5 },
                { name: 'A.ma1', complexity: 1 },
                { name: 'A.ma2', complexity: 6 },
                { name: 'B.mb1', complexity: 2 },
                { name: 'B.mb2', complexity: 3 },
                { name: 'B.mb3', complexity: 4 }
              ]
            });

            expect(escomplex.analyzeModule).toHaveBeenCalledWith('test content', {}, { a: 'optionA', b: 'optionB' });
            expect(fs.readFile).toHaveBeenCalledWith('test/file.js', expect.any(Function));
            done();
          });
        });
      });
    });

    describe('with a transform callback function', function() {
      it('returns the complexity report of the file content modified by the transform callback', function() {
        return new Bluebird(function(done) {
          var report;
          subject.fileAnalysisStream('test/file.js', function(report) {
            return { test: 'some value', result: report.totalComplexity };
          })
          .on('data', function(output) {
            report = output;
          })
          .on('end', function(){
            expect(report).toEqual({
              test: 'some value',
              result: 11
            });

            expect(escomplex.analyzeModule).toHaveBeenCalledWith('test content', {}, { a: 'optionA', b: 'optionB' });
            expect(fs.readFile).toHaveBeenCalledWith('test/file.js', expect.any(Function));
            done();
          });
        });
      });
    });
  });

  describe('.sourceAnalysisStream()', function() {
    describe('without any transform callback function', function() {
      it('reports the complexity of the source content', function() {
        return new Bluebird(function(done) {
          var report;
          var inputStream = new stream.PassThrough();

          inputStream.pipe(subject.sourceAnalysisStream('test/file.js'))
          .on('data', function(output) {
            report = output;
          })
          .on('end', function() {
            expect(report).toEqual({
              path: 'test/file.js',
              totalComplexity: 11,
              averageComplexity: 3.429,
              methodComplexity: [
                { name: 'fn1', complexity: 3 },
                { name: 'fn2', complexity: 5 },
                { name: 'A.ma1', complexity: 1 },
                { name: 'A.ma2', complexity: 6 },
                { name: 'B.mb1', complexity: 2 },
                { name: 'B.mb2', complexity: 3 },
                { name: 'B.mb3', complexity: 4 }
              ]
            });

            expect(escomplex.analyzeModule).toHaveBeenCalledWith('test content', {}, { a: 'optionA', b: 'optionB' });
            done();
          });

          inputStream.write('test content');
          inputStream.end();
        });
      });
    });

     describe('with a transform callback function', function() {
      it('returns the complexity report of the source content modified by the transform callback', function() {
        return new Bluebird(function(done) {
          var report;
          var inputStream = new stream.PassThrough();

          inputStream.pipe(subject.sourceAnalysisStream('test/file.js', function(report) {
            return { test: 'some value', result: report.totalComplexity };
          }))
          .on('data', function(output) {
            report = output;
          })
          .on('end', function() {
            expect(report).toEqual({
              test: 'some value',
              result: 11
            });

            expect(escomplex.analyzeModule).toHaveBeenCalledWith('test content', {}, { a: 'optionA', b: 'optionB' });
            done();
          });

          inputStream.write('test content');
          inputStream.end();
        });
      });
    });
  });
});
