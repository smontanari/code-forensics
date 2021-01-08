/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var os              = require('os'),
    TaskExecutor    = require('./task_executor'),
    StreamProcessor = require('./stream_processor'),
    JobScheduler    = require('./job_scheduler'),
    appConfig       = require('../runtime/app_config');

var concurrency = appConfig.get('serialProcessing') ? 1 : os.cpus().length;
var taskJobScheduler = new JobScheduler(concurrency);
var streamJobScheduler = new JobScheduler(concurrency);

module.exports = {
  taskExecutor: function() {
    return new TaskExecutor(taskJobScheduler);
  },
  streamProcessor: function() {
    return new StreamProcessor(streamJobScheduler);
  }
};
