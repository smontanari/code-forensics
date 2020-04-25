var _        = require('lodash'),
    Bluebird = require('bluebird');

var JobScheduler = require('parallel_processing/job_scheduler');

describe('JobScheduler', function() {
  describe('.addJob()', function() {
    it('returns a promise that completes when the job is executed', function() {
      var scheduler = new JobScheduler();
      var jobFn = jest.fn().mockName('jobFn');

      return scheduler.addJob(jobFn).then(function() {
        expect(jobFn).toHaveBeenCalled();
      });
    });

    it('returns a promise that resolves to the output value of the job', function() {
      var scheduler = new JobScheduler();
      var jobFn = jest.fn().mockName('jobFn').mockReturnValue(123);

      return expect(scheduler.addJob(jobFn)).resolves.toEqual(123);
    });

    it('executes added jobs up to the max number of concurrent jobs', function() {
      var scheduler = new JobScheduler(2);
      var job1 = jest.fn().mockName('jobFn1'),
          job2 = jest.fn().mockName('jobFn2'),
          job3 = jest.fn().mockName('jobFn3');

      var promises = [job1, job2].map(function(jobFn) {
        return _.tap(scheduler.addJob(jobFn), function() {
          expect(jobFn).toHaveBeenCalled();
        });
      });

      promises.push(scheduler.addJob(job3));

      expect(job3).not.toHaveBeenCalled();
      return Bluebird.all(promises).then(function() {
        expect(job3).toHaveBeenCalled();
      });
    });

    it('runs all the jobs in the queue even if one fails', function() {
      var scheduler = new JobScheduler(1);
      var job1 = jest.fn().mockName('jobFn1'),
          job2 = jest.fn().mockName('jobFn2').mockImplementation(
            function() { throw new Error(); }
          ),
          job3 = jest.fn().mockName('jobFn3'),
          job4 = jest.fn().mockName('jobFn4');

      var promises = [job1, job2, job3, job4].map(function(jobFn) {
        return scheduler.addJob(jobFn).reflect();
      });

      return Bluebird.all(promises).then(function() {
        [job1, job2, job3, job4].forEach(function(jobFn) {
          expect(jobFn).toHaveBeenCalled();
        });
      });
    });
  });
});
