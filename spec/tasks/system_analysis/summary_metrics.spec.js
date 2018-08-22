/*global require_src*/
var summaryMetrics = require_src('tasks/system_analysis/summary_metrics');

describe('SummaryMetrics', function() {
  it('returns a metric value including only the given properties', function() {
    expect(summaryMetrics.metricCollector({ stat: 'revisions', value: 10 })).toEqual({ revisions: 10, commits: 0, authors: 0 });
    expect(summaryMetrics.metricCollector({ stat: 'commits', value: 4 })).toEqual({ revisions: 0, commits: 4, authors: 0 });
    expect(summaryMetrics.metricCollector({ stat: 'authors', value: 6 })).toEqual({ revisions: 0, commits: 0, authors: 6 });
    expect(summaryMetrics.metricCollector({ stat: 'files', value: 3 })).toEqual({ revisions: 0, commits: 0, authors: 0 });
  });

  it('returns the metric initial value initialized to 0', function() {
    expect(summaryMetrics.metricInitialValue).toEqual({ revisions: 0, commits: 0, authors: 0 });
  });

  it('maps the metric accumulators to the given properties', function() {
    var item = { revisions: 7, commits: 4, authors: 5 };

    expect(summaryMetrics.metricAccumulatorsMap.cumulativeRevisions(item)).toEqual(7);
    expect(summaryMetrics.metricAccumulatorsMap.cumulativeCommits(item)).toEqual(4);
    expect(summaryMetrics.metricAccumulatorsMap.cumulativeAuthors(item)).toEqual(5);
  });
});
