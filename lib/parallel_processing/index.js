var MultiStreamCollector = require('./multistream_collector'),
    MultiTaskExecutor    = require('./multitask_executor'),
    ParallelJobRunner    = require('./parallel_job_runner'),
    appConfig            = require('../runtime/app_config');

var jobRunner = new ParallelJobRunner(appConfig.get('maxConcurrency'));

module.exports = {
  objectStreamCollector: function() {
    return new MultiStreamCollector(jobRunner, {objectMode: true});
  },
  taskExecutor: function() {
    return new MultiTaskExecutor(jobRunner);
  }
};
