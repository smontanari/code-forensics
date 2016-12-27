var moment = require('moment');

var TimeSplitter      = require_src('models/time_interval/time_splitter'),
    CFValidationError = require_src('models/validation_error');

describe('TimeSplitter', function() {
  beforeEach(function() {
    this.subject = new TimeSplitter(moment('2015-01-01'), moment('2015-12-31'));
  });

  it('throws an error if an invalid frequency is given', function() {
    expect(function() {
      new TimeSplitter(moment('2014-01-01'), moment('2016-01-01')).split('wrong-frequency');
    }).toThrowError(CFValidationError, 'Invalid frequency value: wrong-frequency');
  });

  it('does not split if no frequency is given', function() {
    var subject = new TimeSplitter(moment('2014-01-01'), moment('2016-01-01'));
    expect(subject.split()).toEqual([{start: moment('2014-01-01'), end: moment('2016-01-01')}]);
  });

  it('splits by year', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(2);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-12-31'), 'day')).toBeTruthy();
      expect(periods[1].start.isSame(moment('2015-01-01'), 'day')).toBeTruthy();
      expect(periods[1].end.isSame(moment('2015-12-31'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2016-01-01')).split('yearly'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2016-01-01')).split('1y'));
  });

  it('splits by semester', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(2);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-06-30'), 'day')).toBeTruthy();
      expect(periods[1].start.isSame(moment('2014-07-01'), 'day')).toBeTruthy();
      expect(periods[1].end.isSame(moment('2014-12-31'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2015-01-01')).split('semiannual'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2015-01-01')).split('6m'));
  });

  it('splits by quarter', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(4);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-03-31'), 'day')).toBeTruthy();
      expect(periods[3].start.isSame(moment('2014-10-01'), 'day')).toBeTruthy();
      expect(periods[3].end.isSame(moment('2014-12-31'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2015-01-01')).split('quarterly'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2015-01-01')).split('3m'));
  });

  it('splits every two months', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(3);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-02-28'), 'day')).toBeTruthy();
      expect(periods[2].start.isSame(moment('2014-05-01'), 'day')).toBeTruthy();
      expect(periods[2].end.isSame(moment('2014-06-30'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-07-01')).split('bimonthly'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-07-01')).split('2m'));
  });

  it('splits by month', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(6);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
      expect(periods[5].start.isSame(moment('2014-06-01'), 'day')).toBeTruthy();
      expect(periods[5].end.isSame(moment('2014-06-30'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-07-01')).split('monthly'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-07-01')).split('1m'));
  });

  it('splits by fortnight', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(3);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-11'), 'day')).toBeTruthy();
      expect(periods[2].start.isSame(moment('2014-01-26'), 'day')).toBeTruthy();
      expect(periods[2].end.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-31')).split('fortnightly'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-31')).split('2w'));
  });

  it('splits by week', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(5);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-04'), 'day')).toBeTruthy();
      expect(periods[4].start.isSame(moment('2014-01-26'), 'day')).toBeTruthy();
      expect(periods[4].end.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-31')).split('weekly'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-31')).split('1w'));
  });

  it('splits by day', function() {
    var assertPeriods = function(periods) {
      expect(periods.length).toBe(9);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[8].start.isSame(moment('2014-01-09'), 'day')).toBeTruthy();
      expect(periods[8].end.isSame(moment('2014-01-09'), 'day')).toBeTruthy();
    };

    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-10')).split('daily'));
    assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-10')).split('1d'));
  });
});
