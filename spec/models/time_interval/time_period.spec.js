var TimePeriod = require_src('models/time_interval/time_period');

describe('TimePeriod', function() {
  it('concatenates start and end date', function() {
    expect(new TimePeriod('start', 'end').toString()).toEqual('start_end');
  });
});
