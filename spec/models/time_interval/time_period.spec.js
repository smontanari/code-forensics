var moment = require('moment');

var TimePeriod = require('models/time_interval/time_period');

describe('TimePeriod', function() {
  var period;
  beforeEach(function() {
    period = {
      start: moment('2013-02-08 09:30:26.123'),
      end: moment('2014-01-18 19:10:46.456')
    };
  });

  it('concatenates start and end date', function() {
    expect(new TimePeriod(period, 'YYYY-MM-DD').toString()).toEqual('2013-02-08_2014-01-18');
  });

  it('returns an object with ISO formatted dates', function() {
    expect(new TimePeriod(period, 'YYYY-MM-DD').toISOFormat()).toEqual({
      startDate: '2013-02-08T09:30:26.123Z',
      endDate: '2014-01-18T19:10:46.456Z'
    });
  });

  it('returns the dates displayed with the given format', function() {
    expect(new TimePeriod(period, 'MM-DD-YYYY').toDisplayFormat()).toEqual({
      startDate: '02-08-2013',
      endDate: '01-18-2014'
    });
  });
});
