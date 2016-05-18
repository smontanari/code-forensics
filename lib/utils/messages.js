var chalk       = require('chalk'),
    querystring = require('querystring');

module.exports = {
  logGraphUrl: function(serverPort, params) {
    console.log("Open the following link to see the results:");
    console.log(chalk.blue('http://localhost:' + serverPort + '/index.html?' + querystring.stringify(params)));
  }
};
