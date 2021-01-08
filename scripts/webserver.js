#!/usr/bin/env node

/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Koa            = require('koa'),
    mount          = require('koa-mount'),
    serveStatic    = require('koa-static'),
    LocalWebServer = require('local-web-server'),
    findup         = require('findup-sync'),
    ansi           = require('ansi-colors'),
    Path           = require('path'),
    parseArgs      = require('minimist'),
    _              = require('lodash');

var ApiMiddleware   = require(Path.resolve(__dirname, '../lib/api_middleware')),
    runtimeDefaults = require(Path.resolve(__dirname, '../lib/runtime/defaults'));


var args = parseArgs(process.argv.slice(2), {
  default: {
    'd': Path.resolve(runtimeDefaults.configuration.outputDir),
    'p': 3000
  }
});

var publicPath = Path.resolve(__dirname, '../public');
var jsPath = Path.resolve(__dirname, '../lib/web');
var libPath = findup('node_modules');
var dataPath = args.d;

var ROUTES = {
  '/js': jsPath,
  '/lib': libPath,
  '/data': dataPath
};

var StaticRoutes = new Function();
StaticRoutes.prototype.middleware = function() {
  return _.map(ROUTES, function(path, route) {
    var staticRoute = new Koa();
    staticRoute.use(serveStatic(path, {}));
    return mount(route, staticRoute);
  });
};

var options = {
  hostname: '0.0.0.0',
  port: args.p,
  directory: publicPath,
  reportDir: dataPath,
  stack: [
    'static',
    StaticRoutes,
    ApiMiddleware
  ]
};

/* eslint-disable no-console */
console.log(ansi.yellow('Web server listening on ' + options.hostname + ':' + options.port));
console.log(ansi.cyan('serving "/"     files from ' + publicPath));
console.log(ansi.cyan('serving "/js"   files from ' + jsPath));
console.log(ansi.cyan('serving "/lib"  files from ' + libPath));
console.log(ansi.cyan('serving "/data" files from ' + dataPath));
console.log('Hit CTRL-C to stop the server');

var lws = LocalWebServer.create(options);

['SIGINT', 'SIGTERM'].forEach(function(event) {
  process.on(event, function() {
    lws.server.close();
    console.log(ansi.yellow('\nWeb server stopped.'));
  });
});

/* eslint-enable no-console */
