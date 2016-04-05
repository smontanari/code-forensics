#!/usr/bin/env node
var httpServer = require('http-server/lib/http-server'),
    ecstatic   = require('ecstatic'),
    chalk      = require('chalk'),
    Path       = require('path');

var args = require('minimist')(process.argv.slice(2));

var host = '127.0.0.1';
var port = args.p || 8080;
var dataPath = args.d || Path.resolve(__dirname + '/../output');

var options = {
  root: Path.resolve(__dirname + '/../web'),
  cache: -1,
  showDir: true,
  autoIndex: true,
  before: [
    ecstatic({root: Path.resolve(__dirname + "/../node_modules"), baseDir: "/lib"}),
    ecstatic({root: dataPath, baseDir: "/data"}),
  ]
};

var server = httpServer.createServer(options);

server.listen(port, host, function () {
  console.log(chalk.yellow('Starting up http-server'));
  console.log(chalk.cyan('listening on ' + port));
  console.log(chalk.cyan('serving data from ' + dataPath));
  console.log('Hit CTRL-C to stop the server');
});


['SIGINT', 'SIGTERM'].forEach(function(event) {
  process.on(event, function() {
    console.log(chalk.red('http-server stopped.'));
    process.exit();
  });
});
