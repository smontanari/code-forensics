var TimePeriod = require_src('time_interval/time_period');

describe('time_interval', function() {
  describe('TimePeriod', function() {
    it('concatenates start and end date', function() {
      expect(new TimePeriod('start', 'end').toString()).toEqual('start_end');
    });
  });
});
