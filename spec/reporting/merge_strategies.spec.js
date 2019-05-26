var MergeStrategies = require('reporting/merge_strategies');

describe('MergeStrategies', function() {
  var reportItem, dataSourceItem;
  beforeEach(function() {
    reportItem = { a: 123, b: 456 };
    dataSourceItem = { c: 'qwe', d: 'asd' };
  });

  describe('extension', function() {
    it('extends the report item by transforming the data source item', function() {
      MergeStrategies.extension('d')(reportItem, dataSourceItem);

      expect(reportItem).toEqual({ a: 123, b: 456, d: 'asd' });
    });
  });
});
