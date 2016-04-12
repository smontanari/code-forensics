var chalk       = require('chalk'),
    querystring = require('querystring'),
    appConfig   = require('../runtime/app_config');

module.exports = {
  logGraphUrl: function(params) {
    console.log("Open the following link to see the results:");
    console.log(chalk.blue('http://localhost:' + appConfig.serverPort + '/index.html?' + querystring.stringify(params)));
  }
};
