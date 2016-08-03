var TimePeriodBuilder = require_src('time_interval/builder').Builder;

describe('TimePeriodBuilder', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2015, 8, 23));
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  describe('with no start and end date given', function() {
    it('returns an empty array of time periods', function() {
      var periods = new TimePeriodBuilder('DD-MM-YYYY')
        .split('monthly')
        .build();

      expect(periods.length).toEqual(0);
    });
  });

  describe('with no end date given', function() {
    it('returns an array of time periods ending with the current date', function() {
      var periods = new TimePeriodBuilder('DD-MM-YYYY')
        .from('15-04-2015')
        .split('monthly')
        .build();

      expect(periods.length).toEqual(6);
      expect(periods[0].toString()).toEqual('15-04-2015_30-04-2015');
      expect(periods[1].toString()).toEqual('01-05-2015_31-05-2015');
      expect(periods[2].toString()).toEqual('01-06-2015_30-06-2015');
      expect(periods[3].toString()).toEqual('01-07-2015_31-07-2015');
      expect(periods[4].toString()).toEqual('01-08-2015_31-08-2015');
      expect(periods[5].toString()).toEqual('01-09-2015_23-09-2015');
    });
  });

  describe('with no split frequency given', function() {
    it('returns an array of one time period', function() {
      var periods = new TimePeriodBuilder('DD-MM-YYYY')
        .from('15-04-2015')
        .to('19-05-2015')
        .build();

      expect(periods.length).toEqual(1);
      expect(periods[0].toString()).toEqual('15-04-2015_19-05-2015');
    });
  });

  describe('with all parameters given', function() {
    it('returns an array of time periods', function() {
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
});
