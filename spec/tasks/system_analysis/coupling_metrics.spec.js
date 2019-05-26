var couplingMetrics = require('tasks/system_analysis/coupling_metrics');

describe('CouplingMetrics', function() {
  it('returns the coupling metrics', function() {
    expect(couplingMetrics.selector({ coupledPath: 'test/path', couplingDegree: 10 })).toEqual({
      coupledName: 'test/path',
      couplingDegree: 10
    });
  });
});
