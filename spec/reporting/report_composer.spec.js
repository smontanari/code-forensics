var Bluebird = require('bluebird'),
    stream   = require('stream');

var ReportComposer  = require_src('reporting/report_composer'),
    MergeStrategies = require_src('reporting/merge_strategies'),
    utils           = require_src('utils');

describe('ReportComposer', function() {
  describe('when initialised with an array', function() {
    it('builds a report from the array data', function(done) {
      new ReportComposer([
        { a: 123, b: "zxc" },
        { a: 456, b: "vbn" }
      ]).buildReport().then(function(reportData) {
        expect(reportData).toEqual([
          { a: 123, b: "zxc" },
          { a: 456, b: "vbn" }
        ]);
        done();
      });
    });
  });

  describe('when initialised with a json file', function() {
    it('builds a report from the file data', function(done) {
      spyOn(utils.fileSystem, 'isFile').and.returnValue(true);
      spyOn(utils.json, 'fileToObject').and.returnValue(
        Bluebird.resolve([{ a: 123, b: "zxc" }, { a: 456, b: "vbn" }])
      );

      new ReportComposer('test/file.json').buildReport().then(function(reportData) {
        expect(reportData).toEqual([
          { a: 123, b: "zxc" },
          { a: 456, b: "vbn" }
        ]);

        expect(utils.fileSystem.isFile).toHaveBeenCalledWith('test/file.json');
        expect(utils.json.fileToObject).toHaveBeenCalledWith('test/file.json');
        done();
      });
    });
  });

  describe('when initialised with a stream', function() {
    it('builds a report from the object stream', function(done) {
      var inputStream = new stream.PassThrough({ objectMode: true });
      new ReportComposer(inputStream).buildReport().then(function(reportData) {
        expect(reportData).toEqual([
          { a: 123, b: "zxc" },
          { a: 456, b: "vbn" }
        ]);
        done();
      });

      inputStream.write({ a: 123, b: "zxc" });
      inputStream.write({ a: 456, b: "vbn" });
      inputStream.end();
    });
  });

  it('fails if initialised with an invalid data source', function(done) {
    spyOn(utils.fileSystem, 'isFile').and.returnValue(false);
    new ReportComposer('some invalid thing').buildReport().catch(function(err) {
      expect(err.message).toEqual('Invalid report source data: some invalid thing');
      expect(utils.fileSystem.isFile).toHaveBeenCalledWith('some invalid thing');
      done();
    });
  });

  describe('merge methods', function() {
    beforeEach(function() {
      this.subject = new ReportComposer([
        { a: 123, b: "qwe" },
        { a: 456, b: "vbn" },
        { a: 123, b: "zxc" },
        { a: 999, b: "asd" }
      ]);
    });

    describe('.merge()', function() {
      it('builds a report from the merged data sources', function(done) {
        var matchFn = function(d1, d2) { return d1.a === d2.a; };
        spyOn(utils.fileSystem, 'isFile').and.returnValue(true);
        spyOn(utils.json, 'fileToObject').and.returnValue(
          Bluebird.resolve([{ a: 123, c: "XXX" }, { a: 456, c: "YYY" }, { a: 789, c: 'ZZZ' }])
        );
        var inputStream = new stream.PassThrough({ objectMode: true });

        this.subject.mergeAll([
          ReportComposer.newDataSource('test/file.json', { matchStrategy: matchFn, mergeStrategy: MergeStrategies.extension('c') }),
          ReportComposer.newDataSource(inputStream, {
            matchStrategy: matchFn,
            mergeStrategy: function(reportItem, dataItem) {
              if (dataItem.stop === true) {  return false; }
              reportItem.d = dataItem.d;
            }
          })
        ]).buildReport().then(function(reportData) {
          expect(reportData).toEqual([
            { a: 123, b: "qwe", c: 'XXX', d: { d1: 111, d2: 222 } },
            { a: 456, b: "vbn", c: 'YYY', d: { d1: 333, d2: 444 } },
            { a: 123, b: "zxc", c: 'XXX', d: { d1: 111, d2: 222 } },
            { a: 999, b: "asd" }
          ]);

          expect(utils.fileSystem.isFile).toHaveBeenCalledWith('test/file.json');
          expect(utils.json.fileToObject).toHaveBeenCalledWith('test/file.json');
          done();
        });

        inputStream.write({ a: 123, d: { d1: 111, d2: 222 } });
        inputStream.write({ a: 456, d: { d1: 333, d2: 444 } });
        inputStream.write({ a: 789, d: { d1: 555, d2: 666 } });
        inputStream.write({ a: 999, stop: true });
        inputStream.write({ a: 999, d: { d1: 777, d2: 888 } });
        inputStream.end();
      });
    });

    describe('.mergeWith()', function() {
      it('builds a report from the merged data sources', function(done) {
        var matchFn = function(d1, d2) { return d1.a === d2.a; };
        spyOn(utils.fileSystem, 'isFile').and.returnValue(true);
        spyOn(utils.json, 'fileToObject').and.returnValue(
          Bluebird.resolve([{ a: 123, c: "XXX" }, { a: 456, c: "YYY" }, { a: 789, c: 'ZZZ' }])
        );
        var inputStream = new stream.PassThrough({ objectMode: true });

        this.subject
        .mergeWith('test/file.json', { matchStrategy: matchFn, mergeStrategy: MergeStrategies.extension('c') })
        .mergeWith(inputStream, { matchStrategy: matchFn, mergeStrategy: MergeStrategies.extension(function(item) { return { d: item.d }; }) })
        .buildReport().then(function(reportData) {
          expect(reportData).toEqual([
            { a: 123, b: "qwe", c: 'XXX', d: { d1: 111, d2: 222 } },
            { a: 456, b: "vbn", c: 'YYY', d: { d1: 333, d2: 444 } },
            { a: 123, b: "zxc", c: 'XXX', d: { d1: 111, d2: 222 } },
            { a: 999, b: "asd" }
          ]);

          expect(utils.fileSystem.isFile).toHaveBeenCalledWith('test/file.json');
          expect(utils.json.fileToObject).toHaveBeenCalledWith('test/file.json');
          done();
        });

        inputStream.write({ a: 123, d: { d1: 111, d2: 222 } });
        inputStream.write({ a: 456, d: { d1: 333, d2: 444 } });
        inputStream.write({ a: 789, d: { d1: 555, d2: 666 } });
        inputStream.end();
      });
    });
  });
});
