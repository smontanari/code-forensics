var _ = require('lodash');

var TaskContext  = require_src('runtime/task_context').TaskContext,
    timeInterval = require_src('time_interval/builder'),
    repository   = require_src('runtime/repository'),
    appConfig    = require_src('runtime/app_config');

describe('TaskContext', function() {
  var mockPeriodBuilder;

  beforeEach(function() {
    mockPeriodBuilder = {};
    _.each(['from', 'to', 'split'], function(fn) {
      mockPeriodBuilder[fn] = jasmine.createSpy().and.returnValue(mockPeriodBuilder);
    });
    mockPeriodBuilder.build = jasmine.createSpy().and.returnValue([
      {startDate: 'date1', endDate: 'date2'},
      {startDate: 'date3', endDate: 'date4'}
    ]);
    spyOn(timeInterval, 'Builder').and.returnValue(mockPeriodBuilder);

    spyOn(repository, 'RepositoryConfiguration').and.returnValue({obj: 'test-repo'});
  });

  it('initialises the repository configuration', function() {
    var ctx = new TaskContext({repository: 'repo-config'}, {});

    expect(repository.RepositoryConfiguration).toHaveBeenCalledWith('repo-config');
    expect(ctx.repository).toEqual({obj: 'test-repo'});
  });

  it('creates the time periods and a date range', function() {
    var ctx = new TaskContext({dateFormat: 'YYYY'}, {dateFrom: 'test-date1', dateTo: 'test-date2', frequency: 'test-frequency'});

    expect(ctx.timePeriods).toEqual([
      {startDate: 'date1', endDate: 'date2'},
      {startDate: 'date3', endDate: 'date4'}
    ]);

    expect(ctx.dateRange.toString()).toEqual('date1_date4');

    expect(timeInterval.Builder).toHaveBeenCalledWith('YYYY');
    expect(mockPeriodBuilder.from).toHaveBeenCalledWith('test-date1');
    expect(mockPeriodBuilder.to).toHaveBeenCalledWith('test-date2');
    expect(mockPeriodBuilder.split).toHaveBeenCalledWith('test-frequency');
  });

  it('initialises properties from given configuration', function() {
    var ctx = new TaskContext({
      tempDir: '/test-temp-dir',
      outputDir: '/test-out-dir',
      dateFormat: 'XXXX',
      architecturalBoundaries: {'test-boundary-name': 'test-boundaries'},
      commitCloudFilters: [/filter1/, 'filter2'],
      languages: ['lang1', 'lang2']
    }, { boundary: 'test-boundary-name', taskName: 'test-task', frequency: 'test-frequency' });

    expect(ctx.tempDir).toEqual('/test-temp-dir');
    expect(ctx.outputDir).toEqual('/test-out-dir');
    expect(ctx.dateFormat).toEqual('XXXX');
    expect(ctx.helpTaskName).toEqual('test-task');
    expect(ctx.frequency).toEqual('test-frequency');
    expect(ctx.boundaryDefinition).toEqual({ name: 'test-boundary-name', boundaries: 'test-boundaries' });
    expect(ctx.commitCloudFilters).toEqual([/filter1/, 'filter2']);
    expect(ctx.languages).toEqual(['lang1', 'lang2']);
  });
});
