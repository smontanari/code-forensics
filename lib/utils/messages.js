var chalk = require('chalk'),
    log   = require('./log');

module.exports = {
  logReportUrl: function(serverPort, reportId) {
    log("Open the following link to see the results:");
    log(chalk.blue('http://localhost:' + serverPort + '/index.html?reportId=' + reportId));
  }
};
