var chalk = require('chalk');

module.exports = {
  logReportUrl: function(serverPort, reportId) {
    console.log("Open the following link to see the results:");
    console.log(chalk.blue('http://localhost:' + serverPort + '/index.html?reportId=' + reportId));
  }
};
