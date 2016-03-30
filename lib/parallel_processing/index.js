var MultiStreamCollector = require('./multistream_collector'),
    MultiTaskExecutor    = require('./multitask_executor'),
    ParallelJobRunner    = require('./parallel_job_runner');

var getNextFnQueue = function(inputArray, handler) {
  return inputArray.map(function(item) {
    return function() {
      return handler(item);
    };
  });
};

module.exports = {
  ParallelJobRunner: ParallelJobRunner,
  objectStreamCollector: function(inputArray, streamFactoryFn) {
    return new MultiStreamCollector(getNextFnQueue(inputArray, streamFactoryFn), {objectMode: true});
  },
  taskExecutor: function(inputArray, taskFactoryFn) {
    return new MultiTaskExecutor(getNextFnQueue(inputArray, taskFactoryFn));
  }
};
