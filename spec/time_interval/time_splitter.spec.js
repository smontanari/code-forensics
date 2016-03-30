var moment = require('moment');

var TimeSplitter = require_src('time_interval/time_splitter');

describe('time_interval', function() {
  describe('TimeSplitter', function() {
    beforeEach(function() {
      this.subject = new TimeSplitter(moment('2015-01-01'), moment('2015-12-31'));
    });

    it('does not split', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2016-01-01'));
      expect(subject.split()).toEqual([{start: moment('2014-01-01'), end: moment('2016-01-01')}]);
    });

    it('splits by year', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2016-01-01'));
      var periods = subject.split('yearly');

      expect(periods.length).toBe(2);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-12-31'), 'day')).toBeTruthy();
      expect(periods[1].start.isSame(moment('2015-01-01'), 'day')).toBeTruthy();
      expect(periods[1].end.isSame(moment('2015-12-31'), 'day')).toBeTruthy();
    });

    it('splits by semester', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2015-01-01'));
      var periods = subject.split('semiannual');

      expect(periods.length).toBe(2);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-06-30'), 'day')).toBeTruthy();
      expect(periods[1].start.isSame(moment('2014-07-01'), 'day')).toBeTruthy();
      expect(periods[1].end.isSame(moment('2014-12-31'), 'day')).toBeTruthy();
    });

    it('splits by quarter', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2015-01-01'));
      var periods = subject.split('trimestrial');

      expect(periods.length).toBe(4);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-03-31'), 'day')).toBeTruthy();
      expect(periods[3].start.isSame(moment('2014-10-01'), 'day')).toBeTruthy();
      expect(periods[3].end.isSame(moment('2014-12-31'), 'day')).toBeTruthy();
    });

    it('splits every two months', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2014-07-01'));
      var periods = subject.split('bimestrial');

      expect(periods.length).toBe(3);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-02-28'), 'day')).toBeTruthy();
      expect(periods[2].start.isSame(moment('2014-05-01'), 'day')).toBeTruthy();
      expect(periods[2].end.isSame(moment('2014-06-30'), 'day')).toBeTruthy();
    });

    it('splits by month', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2014-07-01'));
      var periods = subject.split('monthly');

      expect(periods.length).toBe(6);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
      expect(periods[5].start.isSame(moment('2014-06-01'), 'day')).toBeTruthy();
      expect(periods[5].end.isSame(moment('2014-06-30'), 'day')).toBeTruthy();
    });

    it('splits by fortnight', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2014-01-31'));
      var periods = subject.split('fortnightly');

      expect(periods.length).toBe(3);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-11'), 'day')).toBeTruthy();
      expect(periods[2].start.isSame(moment('2014-01-26'), 'day')).toBeTruthy();
      expect(periods[2].end.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
    });

    it('splits by week', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2014-01-31'));
      var periods = subject.split('weekly');

      expect(periods.length).toBe(5);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-04'), 'day')).toBeTruthy();
      expect(periods[4].start.isSame(moment('2014-01-26'), 'day')).toBeTruthy();
      expect(periods[4].end.isSame(moment('2014-01-31'), 'day')).toBeTruthy();
    });

    it('splits by day', function() {
      var subject = new TimeSplitter(moment('2014-01-01'), moment('2014-01-10'));
      var periods = subject.split('daily');

      expect(periods.length).toBe(9);
      expect(periods[0].start.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[0].end.isSame(moment('2014-01-01'), 'day')).toBeTruthy();
      expect(periods[8].start.isSame(moment('2014-01-09'), 'day')).toBeTruthy();
      expect(periods[8].end.isSame(moment('2014-01-09'), 'day')).toBeTruthy();
    });
  });
});
