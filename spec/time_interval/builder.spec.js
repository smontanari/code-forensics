var TimePeriodBuilder = require_src('time_interval/builder').Builder;

describe('TimePeriodBuilder', function() {
  it('returns the array of time periods', function() {
    var periods = new TimePeriodBuilder('DD-MM-YYYY')
      .from('15-04-2015')
      .to('19-05-2015')
      .split('weekly')
      .build();

    expect(periods.length).toEqual(6);
    expect(periods[0].toString()).toEqual('15-04-2015_18-04-2015');
    expect(periods[1].toString()).toEqual('19-04-2015_25-04-2015');
    expect(periods[2].toString()).toEqual('26-04-2015_02-05-2015');
    expect(periods[3].toString()).toEqual('03-05-2015_09-05-2015');
    expect(periods[4].toString()).toEqual('10-05-2015_16-05-2015');
    expect(periods[5].toString()).toEqual('17-05-2015_19-05-2015');
  });
});
