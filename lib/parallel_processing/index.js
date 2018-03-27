/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var MultiStreamCollector = require('./multistream_collector'),
    MultiTaskExecutor    = require('./multitask_executor'),
    ParallelJobRunner    = require('./parallel_job_runner'),
    appConfig            = require('../runtime/app_config');

var jobRunner = new ParallelJobRunner(appConfig.get('maxConcurrency'));

module.exports = {
  objectStreamCollector: function() {
    return new MultiStreamCollector(jobRunner, { objectMode: true });
  },
  taskExecutor: function() {
    return new MultiTaskExecutor(jobRunner);
  },
  objectStreamProcessor: function() {
    return new MultiTaskExecutor(jobRunner, { captureStreamResults: true });
  }
};
