/*global require_src*/
var _      = require('lodash'),
    stream = require('stream');

var LogStreamTransformer = require_src('vcs/git/gitlog_stream_transformer.js');

describe('GitLogStreamTransformer', function() {
  describe('Author name normalisation', function() {
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
      this.subject = new LogStreamTransformer(stubRepository, stubDevelopersInfo);
    });

    it('streams log lines with author name changed according to the developer info', function(done) {
      var logStream = new stream.PassThrough();

      var result = '';
      this.subject.normaliseLogStream(logStream)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual([
            '--98b656f--2016-10-31--Developer 1',
            '--f7633f6--2016-10-31--Developer 3',
            '10  0 test/file1.yml.erb',
            '',
            '--6ff89bc--2016-10-31--Developer_2',
            '1 1 test/file2.rb',
            '',
            '--02790fd--2016-10-31--Developer.3',
            '--5fbfb14--2016-10-28--Developer_2',
            '0 1 test/file3.rb',
            '0 20  test/file4.html.erb',
            '6 8 test/file5.js'
          ].join('\n'));
          done();
        });

      var logLines = [
        '--98b656f--2016-10-31--Developer 1\n',
        '--f7633f6--2016-10-31--Developer 3\n',
        '10  0 test/file1.yml.erb\n',
        '\n',
        '--6ff89bc--2016-10-31--Developer_2\n',
        '1 1 test/file2.rb\n',
        '\n',
        '--02790fd--2016-10-31--Developer.3\n',
        '--5fbfb14--2016-10-28--Alias developer 2\n',
        '0 1 test/file3.rb\n',
        '0 20  test/file4.html.erb\n',
        '6 8 test/file5.js'
      ];

      _.each(logLines, logStream.push.bind(logStream));
      logStream.end();
    });
  });

  describe('File path filtering', function() {
    beforeEach(function() {
      var stubDevelopersInfo = {
        find: function(name) { return { name: name }; }
      };
      var stubRepository = {
        isValidPath: function(path) {
          return path !== 'test/invalid_file.rb';
        }
      };
      this.subject = new LogStreamTransformer(stubRepository, stubDevelopersInfo);
    });

    it('streams log lines filtering out commits with invalid file paths', function(done) {
      var logStream = new stream.PassThrough();

      var result = '';
      this.subject.normaliseLogStream(logStream)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual([
            '--98b656f--2016-10-31--Developer 1',
            '1\t17\ttest/some/file123.rb',
            '42\t0\ttest/another/file456.rb',
            '10\t0\ttest/file1.yml.erb',
            '',
            '--6ff89bc--2016-10-31--Developer_2',
            '',
            '--02790fd--2016-10-31--Developer.3',
            '--5fbfb14--2016-10-28--Developer_2',
            '0\t1\ttest/file3.rb',
            '6\t8\ttest/file5.js'
          ].join('\n'));
          done();
        });

      var logLines = [
        '--98b656f--2016-10-31--Developer 1\n',
        '1\t17\ttest/some/file123.rb\n',
        '42\t0\ttest/another/file456.rb\n',
        '10\t0\ttest/file1.yml.erb\n',
        '\n',
        '--6ff89bc--2016-10-31--Developer_2\n',
        '1\t1\ttest/invalid_file.rb\n',
        '\n',
        '--02790fd--2016-10-31--Developer.3\n',
        '--5fbfb14--2016-10-28--Developer_2\n',
        '0\t1\ttest/file3.rb\n',
        '-\t-\ttest/invalid_file.rb\n',
        '6\t8\ttest/file5.js'
      ];

      _.each(logLines, logStream.push.bind(logStream));
      logStream.end();
    });

    it('does not leave more than 2 empty lines at the end of the stream', function(done) {
      var logStream = new stream.PassThrough();

      var result = '';
      this.subject.normaliseLogStream(logStream)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual([
            '--98b656f--2016-10-31--Developer 1',
            '10\t0\ttest/file1.yml.erb',
            '',
            '--6ff89bc--2016-10-31--Developer_2',
            '',
            ''
          ].join('\n'));
          done();
        });

      var logLines = [
        '--98b656f--2016-10-31--Developer 1',
        '10\t0\ttest/file1.yml.erb',
        '',
        '--6ff89bc--2016-10-31--Developer_2',
        '1\t1\ttest/invalid_file.rb',
        '',
        ''
      ].join('\n');

      _.each(logLines, logStream.push.bind(logStream));
      logStream.end();
    });
  });
});
