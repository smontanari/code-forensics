var summaryMetrics = require('tasks/system_analysis/summary_metrics');

describe('SummaryMetrics', function() {
  it('returns a metric value including only the given properties', function() {
    expect(summaryMetrics.selector({ stat: 'revisions', value: 10 })).toEqual({ revisions: 10 });
    expect(summaryMetrics.selector({ stat: 'commits', value: 4 })).toEqual({ commits: 4 });
    expect(summaryMetrics.selector({ stat: 'authors', value: 6 })).toEqual({ authors: 6 });
    expect(summaryMetrics.selector({ stat: 'files', value: 3 })).toEqual({});
  });

  it('returns the metric initial value initialized to 0', function() {
    expect(summaryMetrics.defaultValue).toEqual({ revisions: 0, commits: 0, authors: 0 });
  });

  it('maps the metric accumulators to the given properties', function() {
    var item = { revisions: 7, commits: 4, authors: 5 };

    expect(summaryMetrics.accumulatorsMap.cumulativeRevisions(item)).toEqual(7);
    expect(summaryMetrics.accumulatorsMap.cumulativeCommits(item)).toEqual(4);
    expect(summaryMetrics.accumulatorsMap.cumulativeAuthors(item)).toEqual(5);
  });
});
