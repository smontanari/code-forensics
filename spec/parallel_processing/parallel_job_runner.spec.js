var _ = require('lodash');

var ParallelJobRunner = require_src('parallel_processing/parallel_job_runner');

describe('ParallelJobRunner', function() {
  describe('.addJob()', function() {
    it('starts executing the added job if not other job in the queue', function() {
      var runner = new ParallelJobRunner();
      var jobFn = jasmine.createSpy('jobFn');
      runner.addJob(jobFn);

      expect(jobFn).toHaveBeenCalledWith();
    });

    it('executes added jobs up to the max number of concurrent jobs', function(done) {
      var runner = new ParallelJobRunner(2);
      var job1 = jasmine.createSpy('jobFn1'),
          job2 = jasmine.createSpy('jobFn2'),
          job3 = jasmine.createSpy('jobFn3');

      _.each([job1, job2, job3], function(jobFn) {
        runner.addJob(jobFn);
      });

      expect(job1).toHaveBeenCalledWith();
      expect(job2).toHaveBeenCalledWith();
      expect(job3).not.toHaveBeenCalledWith();
      _.delay(function() {
        expect(job3).toHaveBeenCalledWith();
        done();
      }, 10);
    });
  });
});
