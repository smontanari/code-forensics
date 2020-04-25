var _         = require('lodash'),
    stream    = require('stream'),
    Bluebird  = require('bluebird'),
    XmlReader = require('xml-reader');

var LogStreamTransformer = require('vcs/svn/svnlog_stream_transformer.js'),
    XmlUtils             = require('utils/xml_utils');

describe('SvnLogStreamTransformer', function() {
  var LOG_OUTPUT = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<log>',
    '<logentry',
    '   revision="344333">',
    '<author>Developer_1</author>',
    '<date>2016-10-31T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/test/path/src/file1.yml.erb</path>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/another/path/src/file2.java</path>',
    '</paths>',
    '<msg>test message 123</msg>',
    '</logentry>',
    '<logentry',
    '   revision="345094">',
    '<author>Developer_2</author>',
    '<date>2016-10-31T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file"',
    '   action="M">/test/path/src/invalid_file.rb</path>',
    '</paths>',
    '<msg>test message 456</msg>',
    '</logentry>',
    '<logentry',
    '   revision="344885">',
    '<author>Alias developer 2</author>',
    '<date>2016-11-01T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/test/path/src/file4.html.erb</path>',
    '<path',
    '   text-mods="true"',
    '   kind="file"',
    '   action="M"',
    '   prop-mods="false">/test/path/src/invalid_file.rb</path>',
    '</paths>',
    '<msg>test message 789</msg>',
    '</logentry>',
    '</log>'
  ];

  var LOG_OUTPUT_WITH_ONLY_INVALID_PATHS = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<log>',
    '<logentry',
    '   revision="344333">',
    '<author>Developer_1</author>',
    '<date>2016-10-31T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/test/path/src/invalid_file1.yml.erb</path>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/another/path/src/file2.java</path>',
    '</paths>',
    '<msg>test message 123</msg>',
    '</logentry>',
    '<logentry',
    '   revision="344885">',
    '<author>Alias developer 2</author>',
    '<date>2016-11-01T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   text-mods="true"',
    '   kind="file"',
    '   action="M"',
    '   prop-mods="false">/test/path/src/invalid_file.rb</path>',
    '</paths>',
    '<msg>test message 789</msg>',
    '</logentry>',
    '</log>'
  ];

  describe('Author name normalisation', function() {
    var subject;
    beforeEach(function() {
      var stubDevelopersInfo = {
        find: function(name) {
          if (name === 'Alias developer 2') { return { name: 'Developer_2' }; }
          return { name: name };
        }
      };
      var stubRepository = {
        isValidPath: function() { return true; }
      };
      var stubAdapter = {
        vcsRelativePath: function() { return '^/test/path'; }
      };
      subject = new LogStreamTransformer(stubRepository, stubDevelopersInfo, stubAdapter);
    });

    it('streams log entries with author name changed according to the developer info', function() {
      return new Bluebird(function(done) {
        var logStream = new stream.PassThrough();

        var result = '';
        subject.normaliseLogStream(logStream)
          .on('data', function(chunk) {
            result += chunk.toString();
          })
          .on('end', function() {
            var rootNode = XmlReader.parseSync(result);
            var logEntries = _.filter(rootNode.children, XmlUtils.nodeWithName('logentry'));
            var authors = logEntries.map(function(entry) {
              var authorElement = _.find(entry.children, XmlUtils.nodeWithName('author'));
              return XmlUtils.nodeText(authorElement);
            });

            expect(authors).toEqual(['Developer_1', 'Developer_2', 'Developer_2']);
            done();
          });

        LOG_OUTPUT.forEach(logStream.push.bind(logStream));
        logStream.end();
      });
    });
  });

  describe('File path filtering', function() {
    var subject;
    beforeEach(function() {
      var stubDevelopersInfo = {
        find: function(name) { return { name: name }; }
      };
      var stubRepository = {
        isValidPath: function(path) { return path && !/invalid_file/.test(path); }
      };
      var stubAdapter = {
        vcsRelativePath: function() { return '^/test/path\n'; }
      };
      subject = new LogStreamTransformer(stubRepository, stubDevelopersInfo, stubAdapter);
    });

    it('streams log entries normalising the valid paths and filtering out the invalid ones', function() {
      return new Bluebird(function(done) {
        var capturedPathnames = 0;
        var logStream = new stream.PassThrough();

        var result = '';
        subject.normaliseLogStream(logStream, function(result) { if (result) capturedPathnames++; })
          .on('data', function(chunk) {
            result += chunk.toString();
          })
          .on('end', function() {
            var rootNode = XmlReader.parseSync(result);
            var logEntries = _.filter(rootNode.children, XmlUtils.nodeWithName('logentry'));
            var revisions = logEntries.map(function(entry) { return entry.attributes.revision; });
            var paths = _.flatMap(logEntries, function(entry) {
              var pathsElement = _.find(entry.children, XmlUtils.nodeWithName('paths'));
              return pathsElement.children.map(XmlUtils.nodeText);
            });

            expect(revisions).toEqual(['344333', '345094', '344885']);
            expect(paths).toEqual(['src/file1.yml.erb', 'src/file4.html.erb']);
            expect(capturedPathnames).toEqual(2);
            done();
          });

        LOG_OUTPUT.forEach(logStream.push.bind(logStream));
        logStream.end();
      });
    });

    it('streams log entries filtering out all the paths', function() {
      return new Bluebird(function(done) {
        var capturedPathnames = 0;
        var logStream = new stream.PassThrough();

        var result = '';
        subject.normaliseLogStream(logStream, function(result) { if (result) capturedPathnames++; })
          .on('data', function(chunk) {
            result += chunk.toString();
          })
          .on('end', function() {
            var rootNode = XmlReader.parseSync(result);
            var logEntries = _.filter(rootNode.children, XmlUtils.nodeWithName('logentry'));
            var revisions = logEntries.map(function(entry) { return entry.attributes.revision; });
            var paths = _.flatMap(logEntries, function(entry) {
              var pathsElement = _.find(entry.children, XmlUtils.nodeWithName('paths'));
              return pathsElement.children.map(XmlUtils.nodeText);
            });

            expect(revisions).toEqual(['344333', '344885']);
            expect(paths).toEqual([]);
            expect(capturedPathnames).toEqual(0);
            done();
          });

        LOG_OUTPUT_WITH_ONLY_INVALID_PATHS.forEach(logStream.push.bind(logStream));
        logStream.end();
      });
    });
  });
});
