var MultiStreamCollector = require('./multistream_collector'),
    MultiTaskExecutor    = require('./multitask_executor'),
    ParallelJobRunner    = require('./parallel_job_runner');

module.exports = {
  ParallelJobRunner: ParallelJobRunner,
  objectStreamCollector: function(jobRunner) {
    return new MultiStreamCollector(jobRunner, {objectMode: true});
  },
  taskExecutor: function(jobRunner) {
    return new MultiTaskExecutor(jobRunner);
  }
};
