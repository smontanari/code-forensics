/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var router      = require('koa-route'),
    JSONStream  = require('JSONStream'),
    multistream = require('multistream'),
    loadReports = require('./load_reports');

var ApiMiddleware = new Function();
ApiMiddleware.prototype.optionDefinitions = function() {
  return [
    { name: 'reportDir', type: String, description: 'Reports output folder' }
  ];
};
ApiMiddleware.prototype.middleware = function(config) {
  return [
    router.get('/allReports', function(ctx) {
      ctx.response.type = 'json';
      ctx.response.status = 200;

      ctx.response.body = multistream.obj(loadReports(config.reportDir))
        .pipe(JSONStream.stringify('[\n', ',\n', '\n]\n'));
    })
  ];
};

module.exports = ApiMiddleware;
