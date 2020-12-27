var _        = require('lodash'),
    Path     = require('path'),
    Bluebird = require('bluebird'),
    fs       = require('fs'),
    del      = require('del'),
    mkdirp   = require('mkdirp');

var logger = require('log');
var loadReports = require('api_middleware/load_reports');

describe('loadReports', function() {
  // eslint-disable-next-line no-undef
  var outputDir = Path.join(TEST_FIXTURES_DIR, 'test_reports');

  var createReportManifests = function() {
    _.each([
      '{ "name": "A report manifest" }',
      undefined,
      '{ "name": "Another report manifest" }'
    ], function(json, index) {
      var reportDir = Path.join(outputDir, 'report-' + (index + 1));
      mkdirp.sync(reportDir);
      if (json) {
        fs.writeFileSync(Path.join(reportDir, 'manifest.json'), json);
      }
    });
  };

  beforeEach(function() {
    createReportManifests();
  });

  afterEach(function() {
    return del(outputDir);
  });

  it('returns a list of streams for each valid report manifest', function() {
    expect(loadReports(outputDir)).toHaveLength(2);
  });

  it.each([
    [0, { name: 'A report manifest' }],
    [1, { name: 'Another report manifest' }]
  ])('returns a stream with the manifest data', function(reportIndex, expectedData) {
    var streams = loadReports(outputDir);
    return new Bluebird(function(done) {
      streams[reportIndex]
        .on('data', function(data) {
          expect(data).toEqual(expectedData);
        })
        .on('end', done);
    });
  });

  it('logs', function() {
    loadReports(outputDir);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringMatching(/Report manifest not found: .*\/test_reports\/report-2\/manifest.json/)
    );
  });
});
