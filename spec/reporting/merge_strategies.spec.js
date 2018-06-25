/*global require_src*/
var MergeStrategies = require_src('reporting/merge_strategies');

describe('MergeStrategies', function() {
  beforeEach(function() {
    this.reportItem = { a: 123, b: 456 };
    this.dataSourceItem = { c: 'qwe', d: 'asd' };
  });

  describe('extension', function() {
    it('extends the report item by transforming the data source item', function() {
      MergeStrategies.extension('d')(this.reportItem, this.dataSourceItem);

      expect(this.reportItem).toEqual({ a: 123, b: 456, d: 'asd' });
    });
  });
});
