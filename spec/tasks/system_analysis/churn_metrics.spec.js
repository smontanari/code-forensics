var churnMetrics = require('tasks/system_analysis/churn_metrics');

describe('ChurnMetrics', function() {
  describe('selector', function() {
    it('returns the loc metrics with their total', function() {
      expect(churnMetrics.selector({ addedLines: 14, deletedLines: 10 })).toEqual({
        addedLines: 14,
        deletedLines: 10,
        totalLines: 4
      });
    });

    it('returns the loc metrics reset to zero when the input metrics are not numbers', function() {
      expect(churnMetrics.selector({ addedLines: NaN, deletedLines: NaN })).toEqual({
        addedLines: 0,
        deletedLines: 0,
        totalLines: 0
      });
    });
  });

  it('returns the metrics initial values initialized to 0', function() {
    expect(churnMetrics.defaultValue).toEqual({
      addedLines: 0,
      deletedLines: 0,
      totalLines: 0
    });
  });

  it('returns the cumulative metric for the total lines', function() {
    expect(churnMetrics.accumulatorsMap.cumulativeLines({
      addedLines: 14,
      deletedLines: 10,
      totalLines: 4
    })).toEqual(4);
  });
});
