var stream = require('stream'),
    map    = require("through2-map"),
    moment = require('moment');

var RevisionHelper = require_src('tasks/helpers/revision_helper'),
    vcsSupport     = require_src('vcs_support'),
    pp             = require_src('parallel_processing'),
    utils          = require_src('utils');

describe('RevisionHelper', function() {
  beforeEach(function() {
    this.mockVcs = jasmine.createSpyObj('vcs adapter', ['revisions', 'showRevisionStream']);
    spyOn(vcsSupport, 'adapter').and.returnValue(this.mockVcs);

    this.subject = new RevisionHelper({
      repository: 'test_repository',
      parameters: { targetFile: '/test/file' },
      dateRange: 'date-range'
    });
  });

  describe('.revisionAnalysisStream()', function() {
    var analyser = {
      sourceAnalysisStream: function() {
        return map.obj(function(obj) {
          return { result: obj.analysis + '-result' };
        });
      }
    };

    it('creates a vcs Adapter object with the repository root', function() {
      expect(vcsSupport.adapter).toHaveBeenCalledWith('test_repository');
    });

    describe('when no revisions exist', function() {
      beforeEach(function() {
        this.mockVcs.revisions.and.returnValue([]);
      });

      it('throws an error', function() {
        var subject = this.subject;
        expect(function() {
          subject.revisionAnalysisStream(analyser);
        }).toThrow('No revisions data found');
      });
    });

    describe('when revisions exist', function() {
      beforeEach(function() {
        this.mockVcs.revisions.and.returnValue(['revision1', 'revision2']);

        this.mockStreamCollector = jasmine.createSpyObj('objectStreamCollector', ['mergeAll']);
        spyOn(pp, 'objectStreamCollector').and.returnValue(this.mockStreamCollector);
      });

      it('returns the stream aggregate of all the revisions', function() {
        spyOn(utils.arrays, 'arrayToFnFactory').and.returnValue('revisions');
        this.mockStreamCollector.mergeAll.and.returnValue('final stream');

        expect(this.subject.revisionAnalysisStream(analyser)).toEqual('final stream');

        expect(this.mockVcs.revisions).toHaveBeenCalledWith('/test/file', 'date-range');
        expect(utils.arrays.arrayToFnFactory).toHaveBeenCalledWith(['revision1', 'revision2'], jasmine.any(Function));
        expect(this.mockStreamCollector.mergeAll).toHaveBeenCalledWith('revisions');
      });

      it('collects an analysis result stream for each individual revision', function(done) {
        var streamAnalysisFn;
        spyOn(utils.arrays, 'arrayToFnFactory').and.callFake(function(revisions, fn) {
          streamAnalysisFn = fn;
        });

        var revisionStream = new stream.PassThrough({ objectMode: true });
        this.mockVcs.showRevisionStream.and.returnValue(revisionStream);

        this.subject.revisionAnalysisStream(analyser);
        streamAnalysisFn({ revisionId: '123', date: '2014-01-31' })
          .on('data', function(obj) {
            expect(obj.revision).toEqual('123');
            expect(obj.date.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
            expect(obj.result).toEqual('123-test-analysis-result');
          })
          .on('end', done);

        revisionStream.write({ analysis: '123-test-analysis' });
        revisionStream.end();
      });
    });
  });
});
