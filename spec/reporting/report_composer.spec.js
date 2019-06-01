var ReportComposer    = require('reporting/report_composer'),
    MergeStrategies   = require('reporting/merge_strategies'),
    DataSourceHandler = require('reporting/data_source_handler');

describe('ReportComposer', function() {
  var subject,  mockDataSourceHandler;
  var matchFn = function(d1, d2) { return d1.a === d2.a; };

  beforeEach(function() {
    mockDataSourceHandler = { processDataSource: jest.fn() };
    DataSourceHandler.instance = jest.fn().mockReturnValue(mockDataSourceHandler);
    mockDataSourceHandler.processDataSource
      .mockResolvedValueOnce([
        { a: 123, b: 'qwe' },
        { a: 456, b: 'vbn' },
        { a: 123, b: 'zxc' },
        { a: 999, b: 'asd' }
      ])
      .mockResolvedValueOnce([
        { a: 123, c: 'XXX' },
        { a: 456, c: 'YYY' },
        { a: 789, c: 'ZZZ' }
      ])
      .mockResolvedValueOnce([
        { a: 123, d: { d1: 111, d2: 222 } },
        { a: 456, d: { d1: 333, d2: 444 } },
        { a: 789, d: { d1: 555, d2: 666 } },
        { a: 999, stop: true },
        { a: 999, d: { d1: 777, d2: 888 } }
      ]);

    subject = new ReportComposer('testInitialArray');
  });

  describe('merge a list of data sources', function() {
    it('builds a report from the merged data sources', function() {
      return subject.mergeAll([
        ReportComposer.newDataSource('test/file.json', { matchStrategy: matchFn, mergeStrategy: MergeStrategies.extension('c') }),
        ReportComposer.newDataSource('testInputStream', {
          matchStrategy: matchFn,
          mergeStrategy: function(reportItem, dataItem) {
            if (dataItem.stop === true) {  return false; }
            reportItem.d = dataItem.d;
          }
        })
      ]).buildReport().then(function(reportData) {
        expect(reportData).toEqual([
          { a: 123, b: 'qwe', c: 'XXX', d: { d1: 111, d2: 222 } },
          { a: 456, b: 'vbn', c: 'YYY', d: { d1: 333, d2: 444 } },
          { a: 123, b: 'zxc', c: 'XXX', d: { d1: 111, d2: 222 } },
          { a: 999, b: 'asd' }
        ]);

        expect(mockDataSourceHandler.processDataSource.mock.calls).toHaveLength(3);
        expect(mockDataSourceHandler.processDataSource.mock.calls[0]).toEqual(['testInitialArray']);
        expect(mockDataSourceHandler.processDataSource.mock.calls[1]).toEqual(['test/file.json']);
        expect(mockDataSourceHandler.processDataSource.mock.calls[2]).toEqual(['testInputStream']);
      });
    });
  });

  describe('.mergeWith()', function() {
    it('builds a report from the merged data sources', function() {
      return subject
        .mergeWith('test/file.json', { matchStrategy: matchFn, mergeStrategy: MergeStrategies.extension('c') })
        .mergeWith('testInputStream', { matchStrategy: matchFn, mergeStrategy: MergeStrategies.extension(function(item) { return { d: item.d }; }) })
        .buildReport().then(function(reportData) {
          expect(reportData).toEqual([
            { a: 123, b: 'qwe', c: 'XXX', d: { d1: 111, d2: 222 } },
            { a: 456, b: 'vbn', c: 'YYY', d: { d1: 333, d2: 444 } },
            { a: 123, b: 'zxc', c: 'XXX', d: { d1: 111, d2: 222 } },
            { a: 999, b: 'asd', d: { d1: 777, d2: 888 } }
          ]);

        expect(mockDataSourceHandler.processDataSource.mock.calls).toHaveLength(3);
        expect(mockDataSourceHandler.processDataSource.mock.calls[0]).toEqual(['testInitialArray']);
        expect(mockDataSourceHandler.processDataSource.mock.calls[1]).toEqual(['test/file.json']);
        expect(mockDataSourceHandler.processDataSource.mock.calls[2]).toEqual(['testInputStream']);
      });
    });
  });
});
