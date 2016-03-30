module.exports = function(maxParallelProcs) {
  var maxConcurrentJobs = maxParallelProcs || 1;
  var activeProcs = 0;

  var jobQueue = [];

  var onJobFinished = function() {
    activeProcs--;
    executeNext();
  };

  var executeNext = function() {
    if (jobQueue.length > 0 && activeProcs < maxConcurrentJobs) {
      activeProcs++;
      jobQueue.shift().call().then(onJobFinished);
    }
  };

  this.addJob = function(jobFn) {
    jobQueue.push(jobFn);
    executeNext();
  };
};
