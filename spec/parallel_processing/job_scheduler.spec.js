/*global require_src*/
var _        = require('lodash'),
    Bluebird = require('bluebird');

var JobScheduler = require_src('parallel_processing/job_scheduler');

describe('JobScheduler', function() {
  describe('.addJob()', function() {
    it('returns a promise that completes when the job is executed', function() {
      var scheduler = new JobScheduler();
      var jobFn = jasmine.createSpy('jobFn');

      expect(jobFn).not.toHaveBeenCalled();
      return scheduler.addJob(jobFn).then(function() {
        expect(jobFn).toHaveBeenCalledWith();
      });
    });

    it('returns a promise that resolves to the output value of the job', function() {
      var scheduler = new JobScheduler();
      var jobFn = jasmine.createSpy('jobFn').and.returnValue(123);

      expect(jobFn).not.toHaveBeenCalled();
      return scheduler.addJob(jobFn).then(function(result) {
        expect(result).toEqual(123);
      });
    });

    it('executes added jobs up to the max number of concurrent jobs', function() {
      var scheduler = new JobScheduler(2);
      var job1 = jasmine.createSpy('jobFn1'),
          job2 = jasmine.createSpy('jobFn2'),
          job3 = jasmine.createSpy('jobFn3');

      var promises = _.map([job1, job2], function(jobFn) {
        return _.tap(scheduler.addJob(jobFn), function() {
          expect(jobFn).toHaveBeenCalledWith();
        });
      });

      promises.push(scheduler.addJob(job3));

      expect(job3).not.toHaveBeenCalled();
      return Bluebird.all(promises).then(function() {
        expect(job3).toHaveBeenCalledWith();
      });
    });

    it('runs all the jobs in the queue even if one fails', function() {
      var scheduler = new JobScheduler(1);
      var job1 = jasmine.createSpy('jobFn1'),
          job2 = jasmine.createSpy('jobFn2').and.throwError(),
          job3 = jasmine.createSpy('jobFn3'),
          job4 = jasmine.createSpy('jobFn4');

      var promises = _.map([job1, job2, job3, job4], function(jobFn) {
        return scheduler.addJob(jobFn).reflect();
      });

      return Bluebird.all(promises).then(function() {
        _.each([job1, job2, job3, job4], function(jobFn) {
          expect(jobFn).toHaveBeenCalledWith();
        });
      });
    });
  });
});
