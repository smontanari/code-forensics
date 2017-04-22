var _         = require('lodash'),
    stream    = require('stream'),
    XmlReader = require('xml-reader');

var XmlUtils = require_src('utils/xml_utils');
var LogStreamTransformer = require_src('vcs_support/svn/svnlog_stream_transformer.js');

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
    '   kind="file">/test/file1.yml.erb</path>',
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
    '   action="M">/test/invalid_file.rb</path>',
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
    '   kind="file">/test/file4.html.erb</path>',
    '<path',
    '   text-mods="true"',
    '   kind="file"',
    '   action="M"',
    '   prop-mods="false">/test/invalid_file.rb</path>',
    '</paths>',
    '<msg>test message 789</msg>',
    '</logentry>',
    '</log>'
  ];

  describe('Author name normalisation', function() {
    beforeEach(function() {
      var stubDeveloperInfo = {
        find: function(name) {
          if (name === 'Alias developer 2') { return { name: 'Developer_2' }; }
          return { name: name };
        }
      };
      var stubRepository = {
        isValidPath: function() { return true; }
      };
      this.subject = new LogStreamTransformer(stubRepository, stubDeveloperInfo);
    });

    it('streams log entries with author name changed according to the developer info', function(done) {
      var logStream = new stream.PassThrough();

      var result = '';
      this.subject.normaliseLogStream(logStream)
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

      _.each(LOG_OUTPUT, logStream.push.bind(logStream));
      logStream.end();
    });
  });

  describe('File path filtering', function() {
    beforeEach(function() {
      var stubDeveloperInfo = {
        find: function(name) { return { name: name }; }
      };
      var stubRepository = {
        isValidPath: function(path) {
          return path !== '/test/invalid_file.rb';
        }
      };
      this.subject = new LogStreamTransformer(stubRepository, stubDeveloperInfo);
    });

    it('streams log entries filtering out the invalid paths', function(done) {
      var logStream = new stream.PassThrough();

      var result = '';
      this.subject.normaliseLogStream(logStream)
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
          expect(paths).toEqual(['/test/file1.yml.erb', '/test/file4.html.erb']);
          done();
        });

      _.each(LOG_OUTPUT, logStream.push.bind(logStream));
      logStream.end();
    });
  });
});
