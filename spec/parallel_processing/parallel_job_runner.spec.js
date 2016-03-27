var _         = require('lodash'),
    Q         = require('q');

var ParallelJobRunner = require_src('parallel_processing/parallel_job_runner');

describe('ParallelJobRunner', function() {
  var createDelayedPromise = function(delay) {
    return _.tap(Q.defer(), function(deferred) {
      _.delay(function() { deferred.resolve(); }, delay);
    }).promise;
  };

  describe('addJob', function() {
    it('starts executing the added job if not other job in the queue', function() {
      var runner = new ParallelJobRunner();
      var jobFn = jasmine.createSpy('jobFn').and.returnValue(Q());
      runner.addJob(jobFn);

      expect(jobFn).toHaveBeenCalled();
    });

    it('executes added jobs up to the max number of concurrent jobs', function(done) {
      var runner = new ParallelJobRunner(2);
      var job1 = jasmine.createSpy('jobFn1').and.returnValue(createDelayedPromise(100)),
          job2 = jasmine.createSpy('jobFn2').and.returnValue(createDelayedPromise(100)),
          job3 = jasmine.createSpy('jobFn3').and.returnValue(createDelayedPromise(100));

      _.each([job1, job2, job3], function(jobFn) {
        runner.addJob(jobFn);
      });
      expect(job1).toHaveBeenCalled();
      expect(job2).toHaveBeenCalled();
      expect(job3).not.toHaveBeenCalled();
      _.delay(function() {
        expect(job3).toHaveBeenCalled();
        done();
      }, 350)
    });
  });
});
