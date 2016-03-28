var escomplex = require('escomplex');

var Analyser = require_src('analysers/escomplex/analyser');

describe('analysers', function() {
  describe('escomplex', function() {
    describe('Analyser', function() {
      beforeEach(function() {
        spyOn(escomplex, 'analyse').and.returnValue({
          aggregate: { cyclomatic: 123 },
          functions: [
            { name: 'fn1', cyclomatic: 456 },
            { name: 'fn2', cyclomatic: 789 }
          ]
        });
        this.subject = new Analyser();
      });

      describe('.fileAnalysis()', function() {
        it('reports the complexity of the file content', function() {
          var report = this.subject.fileAnalysis({path: 'test/file', contents: 'test content'});

          expect(report).toEqual({
            totalComplexity: 123,
            averageComplexity: 622.5,
            methodComplexity: [
              { name: 'fn1', complexity: 456 },
              { name: 'fn2', complexity: 789 }
            ]
          });

          expect(escomplex.analyse).toHaveBeenCalledWith('test content', jasmine.any(Object));
        });
      });

      describe('.stringAnalysis()', function() {
        it('reports the complexity of the string content', function() {
          var report = this.subject.stringAnalysis('test content');

          expect(report).toEqual({
            totalComplexity: 123,
            averageComplexity: 622.5,
            methodComplexity: [
              { name: 'fn1', complexity: 456 },
              { name: 'fn2', complexity: 789 }
            ]
          });

          expect(escomplex.analyse).toHaveBeenCalledWith('test content', jasmine.any(Object));
        });
      });
    });
  });
});
