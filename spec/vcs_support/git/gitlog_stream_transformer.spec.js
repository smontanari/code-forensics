var _      = require('lodash'),
    stream = require('stream');

var LogNormaliser = require_src('vcs_support/git/gitlog_stream_transformer.js');

describe('GitLogNormaliser', function() {
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
      this.subject = new LogNormaliser(stubRepository, stubDeveloperInfo);
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
            '10  0 test/file1.yml.erb',
            '',
            '--6ff89bc--2016-10-31--Developer_2',
            '1 1 test/file2.rb',
            '',
            '--02790fd--2016-10-31--Developer.3',
            '--5fbfb14--2016-10-28--Developer_2',
            '0 1 test/file3.rb',
            '0 20  test/file4.html.erb',
            '6 8 test/file5.js\n'
          ].join("\n"));
          done();
        });

      var logLines = [
        '--98b656f--2016-10-31--Developer 1',
        '10  0 test/file1.yml.erb',
        '',
        '--6ff89bc--2016-10-31--Developer_2',
        '1 1 test/file2.rb',
        '',
        '--02790fd--2016-10-31--Developer.3',
        '--5fbfb14--2016-10-28--Alias developer 2',
        '0 1 test/file3.rb',
        '0 20  test/file4.html.erb',
        '6 8 test/file5.js'
      ].join("\n");

      _.each(logLines, logStream.push.bind(logStream));
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
          return path !== 'test/invalid_file.rb';
        }
      };
      this.subject = new LogNormaliser(stubRepository, stubDeveloperInfo);
    });

    it('streams log lines filtering out commits with invalid file paths ', function(done) {
      var logStream = new stream.PassThrough();

      var result = '';
      this.subject.normaliseLogStream(logStream)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual([
            '--98b656f--2016-10-31--Developer 1',
            "10\t0\ttest/file1.yml.erb",
            '',
            '--6ff89bc--2016-10-31--Developer_2',
            '',
            '--02790fd--2016-10-31--Developer.3',
            '--5fbfb14--2016-10-28--Developer_2',
            "0\t1\ttest/file3.rb",
            "6\t8\ttest/file5.js\n"
          ].join("\n"));
          done();
        });

      var logLines = [
        '--98b656f--2016-10-31--Developer 1',
        "10\t0\ttest/file1.yml.erb",
        '',
        '--6ff89bc--2016-10-31--Developer_2',
        "1\t1\ttest/invalid_file.rb",
        '',
        '--02790fd--2016-10-31--Developer.3',
        '--5fbfb14--2016-10-28--Developer_2',
        "0\t1\ttest/file3.rb",
        "-\t-\ttest/invalid_file.rb",
        "6\t8\ttest/file5.js"
      ].join("\n");

      _.each(logLines, logStream.push.bind(logStream));
      logStream.end();
    });
  });
});
