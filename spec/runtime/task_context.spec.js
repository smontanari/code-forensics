var _      = require('lodash'),
    moment = require('moment');

var TaskContext = require_src('runtime/task_context'),
    models      = require_src('models');

describe('TaskContext', function() {
  var mockPeriodBuilder;

  beforeEach(function() {
    mockPeriodBuilder = {};
    _.each(['from', 'to', 'split'], function(fn) {
      mockPeriodBuilder[fn] = jasmine.createSpy().and.returnValue(mockPeriodBuilder);
    });
    mockPeriodBuilder.build = jasmine.createSpy().and.returnValue([
      new models.TimePeriod({ start: moment('2014-03-01'), end: moment('2014-07-31') }, 'YYYY-MM'),
      new models.TimePeriod({ start: moment('2014-08-01'), end: moment('2014-12-31') }, 'YYYY-MM')
    ]);

    spyOn(models, 'TimeIntervalBuilder').and.returnValue(mockPeriodBuilder);
    spyOn(models, 'Repository').and.returnValue({ obj: 'test-repo' });
    spyOn(models, 'DeveloperInfo').and.returnValue({ obj: 'test-devInfo' });
  });

  it('initialises the repository configuration', function() {
    var ctx = new TaskContext({repository: 'repo-config'});

    expect(models.Repository).toHaveBeenCalledWith('repo-config');
    expect(ctx.repository).toEqual({ obj: 'test-repo' });
  });

  it('initialises the developer information', function() {
    var ctx = new TaskContext({ contributors: 'team-config' });

    expect(models.DeveloperInfo).toHaveBeenCalledWith('team-config');
    expect(ctx.developerInfo).toEqual({ obj: 'test-devInfo' });
  });

  describe('time periods configuration', function() {
    it('creates the time periods and a date range with a given date format', function() {
      var ctx = new TaskContext({ dateFormat: 'YYYY-MM' }, { dateFrom: 'test-date1', dateTo: 'test-date2', timeSplit: 'test-timeSplit' });

      expect(ctx.timePeriods.length).toEqual(2);
      expect(ctx.timePeriods[0].toString()).toEqual('2014-03_2014-07');
      expect(ctx.timePeriods[1].toString()).toEqual('2014-08_2014-12');

      expect(ctx.dateRange.toString()).toEqual('2014-03_2014-12');

      expect(models.TimeIntervalBuilder).toHaveBeenCalledWith('YYYY-MM');
      expect(mockPeriodBuilder.from).toHaveBeenCalledWith('test-date1');
      expect(mockPeriodBuilder.to).toHaveBeenCalledWith('test-date2');
      expect(mockPeriodBuilder.split).toHaveBeenCalledWith('test-timeSplit');
    });

    it('creates the time periods and a date range with the default date format', function() {
      var ctx = new TaskContext(undefined, { dateFrom: 'test-date1', dateTo: 'test-date2', timeSplit: 'test-timeSplit' });

      expect(ctx.timePeriods.length).toEqual(2);
      expect(ctx.timePeriods[0].toString()).toEqual('2014-03_2014-07');
      expect(ctx.timePeriods[1].toString()).toEqual('2014-08_2014-12');

      expect(ctx.dateRange.toString()).toEqual('2014-03-01_2014-12-31');

      expect(models.TimeIntervalBuilder).toHaveBeenCalledWith('YYYY-MM-DD');
    });
  });

  it('throws an error for a non supported configuration language', function() {
    expect(function() {
      new TaskContext({ languages: ['javascript', 'ruby', 'some-weird-language'] });
    }).toThrowError(models.CFValidationError, 'Language "some-weird-language" is not supported');
  });

  describe('exposed configuration values', function() {
    it('initialises properties from given configuration', function() {
      var ctx = new TaskContext({
        tempDir: '/test-temp-dir',
        outputDir: '/test-out-dir',
        layerGroups: {'test-grouping-name': { 'test-layers': [] }},
        commitMessageFilters: [/filter1/, 'filter2'],
        languages: ['ruby']
      }, { layerGroup: 'test-grouping-name', taskName: 'test-task', timeSplit: 'test-timeSplit' });

      expect(ctx.tempDir).toEqual('/test-temp-dir');
      expect(ctx.outputDir).toEqual('/test-out-dir');
      expect(ctx.layerGrouping.isEmpty()).toBe(false);
      expect(ctx.commitMessageFilters).toEqual([/filter1/, 'filter2']);
      expect(ctx.languages).toEqual(['ruby']);
    });

    it('initialises properties from default configuration', function() {
      var ctx = new TaskContext({}, { layerGroup: 'test-grouping-name', timeSplit: 'test-timeSplit' });

      expect(ctx.tempDir).toMatch('/tmp');
      expect(ctx.outputDir).toMatch('/output');
      expect(ctx.layerGrouping.isEmpty()).toBe(true);
      expect(ctx.commitMessageFilters).toBeUndefined();
      expect(ctx.languages).toEqual([]);
    });
  });

  it('passes through all the command line parameters merging default values', function() {
    var ctx = new TaskContext({}, { param1: 'test_param1', param2: 'test_param2' });

    expect(ctx.parameters).toEqual({
      param1: 'test_param1',
      param2: 'test_param2',
      maxCoupledFiles: 5,
      minWordCount: 5
    });
  });
});
