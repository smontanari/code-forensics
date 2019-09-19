var _      = require('lodash'),
    moment = require('moment');

var TimeSplitter      = require('models/time_interval/time_splitter'),
    CFValidationError = require('runtime/errors').CFValidationError;

describe('TimeSplitter', function() {
  var assertTimePeriod = function(period, from, to) {
    expect(period.start.toObject()).toEqual(_.extend(from, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }));
    expect(period.end.toObject()).toEqual(_.extend(to, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }));
  };

  describe('logical period splitting', function() {
    it('throws an error if an invalid timeSplit is given', function() {
      expect(function() {
        new TimeSplitter(moment('2014-01-01'), moment('2015-12-31')).split('wrong-timeSplit');
      }).toThrow(CFValidationError, 'Invalid timeSplit value: wrong-timeSplit');
    });

    it('does not split if no timeSplit is given', function() {
      var intervals = new TimeSplitter(moment('2015-01-01'), moment('2015-12-31')).split();

      expect(intervals).toHaveLength(1);

      assertTimePeriod(intervals[0],
        { years: 2015, months: 0, date: 1 },
        { years: 2015, months: 11, date: 31 }
      );
    });

    it('splits by year', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(2);
        assertTimePeriod(periods[0],
          { years: 2014, months: 2, date: 1 },
          { years: 2014, months: 11, date: 31 }
        );
        assertTimePeriod(periods[1],
          { years: 2015, months: 0, date: 1 },
          { years: 2015, months: 10, date: 24 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-03-01'), moment('2015-11-24')).split('eoy'));
    });

    it('splits by quarter', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(4);

        assertTimePeriod(periods[0],
          { years: 2014, months: 1, date: 1 },
          { years: 2014, months: 2, date: 31 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 3, date: 1 },
          { years: 2014, months: 5, date: 30 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 6, date: 1 },
          { years: 2014, months: 8, date: 30 }
        );
        assertTimePeriod(periods[3],
          { years: 2014, months: 9, date: 1 },
          { years: 2014, months: 9, date: 31 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-02-01'), moment('2014-10-31')).split('eoq'));
    });

    it('splits by month', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2014, months: 2, date: 5 },
          { years: 2014, months: 2, date: 31 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 3, date: 1 },
          { years: 2014, months: 3, date: 30 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 4, date: 1 },
          { years: 2014, months: 4, date: 21 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-03-05'), moment('2014-05-21')).split('eom'));
    });

    it('splits by week', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2016, months: 9, date: 15 },
          { years: 2016, months: 9, date: 16 }
        );
        assertTimePeriod(periods[1],
          { years: 2016, months: 9, date: 17 },
          { years: 2016, months: 9, date: 23 }
        );
        assertTimePeriod(periods[2],
          { years: 2016, months: 9, date: 24 },
          { years: 2016, months: 9, date: 30 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2016-10-15'), moment('2016-10-30')).split('eow'));
    });

    it('splits by day', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(4);

        assertTimePeriod(periods[0],
          { years: 2014, months: 0, date: 1 },
          { years: 2014, months: 0, date: 1 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 0, date: 2 },
          { years: 2014, months: 0, date: 2 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 0, date: 3 },
          { years: 2014, months: 0, date: 3 }
        );
        assertTimePeriod(periods[3],
          { years: 2014, months: 0, date: 4 },
          { years: 2014, months: 0, date: 4 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-04')).split('eod'));
      assertPeriods(new TimeSplitter(moment('2014-01-01'), moment('2014-01-04')).split('1d'));
    });
  });

  describe('custom period splitting', function() {
    it('splits every one year or 12 months', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2012, months: 1, date: 7 },
          { years: 2013, months: 1, date: 6 }
        );
        assertTimePeriod(periods[1],
          { years: 2013, months: 1, date: 7 },
          { years: 2014, months: 1, date: 6 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 1, date: 7 },
          { years: 2014, months: 6, date: 30 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2012-02-07'), moment('2014-07-30')).split('1y'));
      assertPeriods(new TimeSplitter(moment('2012-02-07'), moment('2014-07-30')).split('12m'));
    });

    it('splits every three years', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(2);

        assertTimePeriod(periods[0],
          { years: 2012, months: 1, date: 7 },
          { years: 2015, months: 1, date: 6 }
        );
        assertTimePeriod(periods[1],
          { years: 2015, months: 1, date: 7 },
          { years: 2015, months: 6, date: 30 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2012-02-07'), moment('2015-07-30')).split('3y'));
    });

    it('splits every two quarters or six months', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2014, months: 1, date: 7 },
          { years: 2014, months: 7, date: 6 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 7, date: 7 },
          { years: 2015, months: 1, date: 6 }
        );
        assertTimePeriod(periods[2],
          { years: 2015, months: 1, date: 7 },
          { years: 2015, months: 6, date: 30 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-02-07'), moment('2015-07-30')).split('2q'));
      assertPeriods(new TimeSplitter(moment('2014-02-07'), moment('2015-07-30')).split('6m'));
    });

    it('splits every three months', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(5);

        assertTimePeriod(periods[0],
          { years: 2014, months: 1, date: 7 },
          { years: 2014, months: 4, date: 6 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 4, date: 7 },
          { years: 2014, months: 7, date: 6 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 7, date: 7 },
          { years: 2014, months: 10, date: 6 }
        );
        assertTimePeriod(periods[3],
          { years: 2014, months: 10, date: 7 },
          { years: 2015, months: 1, date: 6 }
        );
        assertTimePeriod(periods[4],
          { years: 2015, months: 1, date: 7 },
          { years: 2015, months: 1, date: 21 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-02-07'), moment('2015-02-21')).split('3m'));
    });

    it('splits every two months', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2014, months: 0, date: 10 },
          { years: 2014, months: 2, date: 9 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 2, date: 10 },
          { years: 2014, months: 4, date: 9 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 4, date: 10 },
          { years: 2014, months: 5, date: 15 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-01-10'), moment('2014-06-15')).split('2m'));
    });

    it('splits every one month', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2014, months: 0, date: 10 },
          { years: 2014, months: 1, date: 9 }
        );
        assertTimePeriod(periods[1],
          { years: 2014, months: 1, date: 10 },
          { years: 2014, months: 2, date: 9 }
        );
        assertTimePeriod(periods[2],
          { years: 2014, months: 2, date: 10 },
          { years: 2014, months: 2, date: 15 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2014-01-10'), moment('2014-03-15')).split('1m'));
    });

    it('splits every three weeks or 21 days', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2016, months: 9, date: 5 },
          { years: 2016, months: 9, date: 25 }
        );
        assertTimePeriod(periods[1],
          { years: 2016, months: 9, date: 26 },
          { years: 2016, months: 10, date: 15 }
        );
        assertTimePeriod(periods[2],
          { years: 2016, months: 10, date: 16 },
          { years: 2016, months: 10, date: 30 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2016-10-05'), moment('2016-11-30')).split('3w'));
      assertPeriods(new TimeSplitter(moment('2016-10-05'), moment('2016-11-30')).split('21d'));
    });

    it('splits every one week or seven days', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(3);

        assertTimePeriod(periods[0],
          { years: 2016, months: 9, date: 5 },
          { years: 2016, months: 9, date: 11 }
        );
        assertTimePeriod(periods[1],
          { years: 2016, months: 9, date: 12 },
          { years: 2016, months: 9, date: 18 }
        );
        assertTimePeriod(periods[2],
          { years: 2016, months: 9, date: 19 },
          { years: 2016, months: 9, date: 22 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2016-10-05'), moment('2016-10-22')).split('1w'));
      assertPeriods(new TimeSplitter(moment('2016-10-05'), moment('2016-10-22')).split('7d'));
    });

    it('splits every four days', function() {
      var assertPeriods = function(periods) {
        expect(periods).toHaveLength(4);

        assertTimePeriod(periods[0],
          { years: 2016, months: 10, date: 5 },
          { years: 2016, months: 10, date: 8 }
        );
        assertTimePeriod(periods[1],
          { years: 2016, months: 10, date: 9 },
          { years: 2016, months: 10, date: 12 }
        );
        assertTimePeriod(periods[2],
          { years: 2016, months: 10, date: 13 },
          { years: 2016, months: 10, date: 16 }
        );
        assertTimePeriod(periods[3],
          { years: 2016, months: 10, date: 17 },
          { years: 2016, months: 10, date: 17 }
        );
      };

      assertPeriods(new TimeSplitter(moment('2016-11-05'), moment('2016-11-17')).split('4d'));
    });
  });
});
