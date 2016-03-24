var StreamAggregator = require('./stream_aggregator'),
    TaskAggregator   = require('./task_aggregator'),
    JobRunner        = require('./job_runner');

var getNextFnQueue = function(inputArray, handler) {
  return inputArray.map(function(item) {
    return function() {
      return handler(item);
    }
  });
};

module.exports = {
  JobRunner: JobRunner,
  objectStreamAggregator: function(inputArray, streamFactoryFn) {
    return new StreamAggregator(getNextFnQueue(inputArray, streamFactoryFn), {objectMode: true});
  },
  taskAggregator: function(inputArray, taskFactoryFn) {
    return new TaskAggregator(getNextFnQueue(inputArray, taskFactoryFn));
  }
};
