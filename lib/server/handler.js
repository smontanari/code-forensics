var _             = require('lodash'),
    glob          = require('glob'),
    Path          = require('path'),
    StringDecoder = require('string_decoder').StringDecoder,
    JSONStream    = require('JSONStream'),
    multistream   = require('multistream'),
    chalk         = require('chalk'),
    utils         = require('../utils');

var decoder = new StringDecoder();

var allReportManifestStreams = function(baseDir) {
  return _.reduce(glob.sync(baseDir + '/*'), function(allStreams, reportDir) {
    var manifestFile = Path.join(reportDir, 'manifest.json');
    if (utils.fileSystem.isFile(manifestFile)) {
      allStreams.push(utils.stream.readFileToObjectStream(manifestFile, function(content) {
        return JSON.parse(decoder.write(content));
      }));
    } else {
      utils.log(chalk.red('Report manifest not found: ' + manifestFile));
    }
    return allStreams;
  }, []);
};

module.exports = function(router, dataPath) {
  router.get('/allReports', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;

    multistream.obj(allReportManifestStreams(dataPath))
    .pipe(JSONStream.stringify('[\n', ',\n', '\n]\n'))
    .pipe(res);
  });
};
