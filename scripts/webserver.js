#!/usr/bin/env node
var httpServer = require('http-server/lib/http-server'),
    ecstatic   = require('ecstatic'),
    chalk      = require('chalk'),
    Path       = require('path');

var args = require('minimist')(process.argv.slice(2));
var server = require(Path.resolve(__dirname , '../lib/server'));

var host = '127.0.0.1';
var port = args.p || 3000;
var webPath = Path.resolve(__dirname + '/../public');
var jsPath = Path.resolve(__dirname + '/../lib/web');
var libPath = Path.resolve('node_modules');
var dataPath = args.d || Path.resolve(__dirname + '/../output');

var options = {
  root: webPath,
  cache: -1,
  showDir: true,
  autoIndex: true,
  before: [
    ecstatic({ root: jsPath, baseDir: '/js' }),
    ecstatic({ root: libPath, baseDir: '/lib' }),
    ecstatic({ root: dataPath, baseDir: '/data' }),
    server.newRouter(dataPath)
  ]
};

var server = httpServer.createServer(options);

server.listen(port, host, function () {
  console.log(chalk.yellow('Starting up http-server'));
  console.log(chalk.cyan('listening on ' + port));
  console.log(chalk.cyan('serving pages from ' + webPath));
  console.log(chalk.cyan('serving js files from ' + jsPath));
  console.log(chalk.cyan('serving js libraries from ' + libPath));
  console.log(chalk.cyan('serving data from ' + dataPath));
  console.log('Hit CTRL-C to stop the server');
});


['SIGINT', 'SIGTERM'].forEach(function(event) {
  process.on(event, function() {
    console.log(chalk.yellow('http-server stopped.'));
    process.exit();
  });
});
