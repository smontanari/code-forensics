#!/usr/bin/env node

/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var httpServer = require('http-server/lib/http-server'),
    findup     = require('findup-sync'),
    ecstatic   = require('ecstatic'),
    chalk      = require('chalk'),
    Path       = require('path');

var args   = require('minimist')(process.argv.slice(2));
var server = require(Path.resolve(__dirname, '../lib/server'));

var host = '0.0.0.0';
var port = args.p || 3000;
var webPath = Path.resolve(__dirname, '../public');
var jsPath = Path.resolve(__dirname, '../lib/web');
var libPath = findup('node_modules');
var dataPath = args.d || Path.resolve(__dirname, '../output');

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

var webServer = httpServer.createServer(options);

/*eslint-disable no-console, no-process-exit*/

webServer.listen(port, host, function () {
  console.log(chalk.yellow('Starting up http-server'));
  console.log(chalk.cyan('listening on ' + host + ':' + port));
  console.log(chalk.cyan('serving "/"     files from ' + webPath));
  console.log(chalk.cyan('serving "/js"   files from ' + jsPath));
  console.log(chalk.cyan('serving "/lib"  files from ' + libPath));
  console.log(chalk.cyan('serving "/data" files from ' + dataPath));
  console.log('Hit CTRL-C to stop the server');
});


['SIGINT', 'SIGTERM'].forEach(function(event) {
  process.on(event, function() {
    webServer.close();
    console.log(chalk.yellow("\nhttp-server stopped."));
    process.exit(0);
  });
});

/*eslint-disable no-console, no-process-exit*/
