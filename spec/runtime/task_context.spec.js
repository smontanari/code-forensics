var _ = require('lodash');

var TaskContext = require_src('runtime/task_context'),
    models      = require_src('models');

describe('TaskContext', function() {
  var mockPeriodBuilder;

  beforeEach(function() {
    this.appConfigStub({ basedir: '/test' });
    mockPeriodBuilder = {};
    _.each(['from', 'to', 'split'], function(fn) {
      mockPeriodBuilder[fn] = jasmine.createSpy().and.returnValue(mockPeriodBuilder);
    });
    mockPeriodBuilder.build = jasmine.createSpy().and.returnValue([
      {startDate: 'date1', endDate: 'date2'},
      {startDate: 'date3', endDate: 'date4'}
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
    var ctx = new TaskContext({teamsComposition: 'team-config'});

    expect(models.DeveloperInfo).toHaveBeenCalledWith('team-config');
    expect(ctx.developerInfo).toEqual({ obj: 'test-devInfo' });
  });

  describe('time periods configuration', function() {
    it('creates the time periods and a date range with a given date format', function() {
      var ctx = new TaskContext({ dateFormat: 'YYYY' }, { dateFrom: 'test-date1', dateTo: 'test-date2', frequency: 'test-frequency' });

      expect(ctx.timePeriods).toEqual([
        {startDate: 'date1', endDate: 'date2'},
        {startDate: 'date3', endDate: 'date4'}
      ]);

      expect(ctx.dateRange.toString()).toEqual('date1_date4');

      expect(models.TimeIntervalBuilder).toHaveBeenCalledWith('YYYY');
      expect(mockPeriodBuilder.from).toHaveBeenCalledWith('test-date1');
      expect(mockPeriodBuilder.to).toHaveBeenCalledWith('test-date2');
      expect(mockPeriodBuilder.split).toHaveBeenCalledWith('test-frequency');
    });
    it('creates the time periods and a date range with the default date format', function() {
      var ctx = new TaskContext(undefined, { dateFrom: 'test-date1', dateTo: 'test-date2', frequency: 'test-frequency' });

      expect(ctx.timePeriods).toEqual([
        {startDate: 'date1', endDate: 'date2'},
        {startDate: 'date3', endDate: 'date4'}
      ]);

      expect(ctx.dateRange.toString()).toEqual('date1_date4');

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
        architecturalBoundaries: {'test-boundary-name': 'test-boundaries'},
        commitMessagesFilters: [/filter1/, 'filter2'],
        languages: ['ruby']
      }, { boundary: 'test-boundary-name', taskName: 'test-task', frequency: 'test-frequency' });

      expect(ctx.tempDir).toEqual('/test-temp-dir');
      expect(ctx.outputDir).toEqual('/test-out-dir');
      expect(ctx.boundaries).toEqual('test-boundaries');
      expect(ctx.commitMessagesFilters).toEqual([/filter1/, 'filter2']);
      expect(ctx.languages).toEqual(['ruby']);
    });

    it('initialises properties from default configuration', function() {

      var ctx = new TaskContext({}, { boundary: 'test-boundary-name', frequency: 'test-frequency' });

      expect(ctx.tempDir).toEqual('/test/tmp');
      expect(ctx.outputDir).toEqual('/test/output');
      expect(ctx.boundaries).toBeUndefined();
      expect(ctx.commitMessagesFilters).toBeUndefined();
      expect(ctx.languages).toEqual(['javascript']);
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
