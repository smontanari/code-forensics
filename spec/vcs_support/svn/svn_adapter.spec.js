var _      = require('lodash'),
    moment = require('moment'),
    stream = require('stream');

var SvnAdapter = require_src('vcs_support/svn/svn_adapter'),
    TimePeriod = require_src('models/time_interval/time_period'),
    command    = require_src('command');

describe('svn command definition', function() {
  beforeEach(function() {
    this.subject = command.Command.definitions.getDefinition('svn');
    this.mockCheck = jasmine.createSpyObj('check', ['verifyExecutable', 'verifyPackage']);
  });

  it('defines the "svn" command', function() {
    expect(this.subject).toEqual(jasmine.anything());
  });

  it('checks the executable', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.verifyExecutable).toHaveBeenCalledWith('svn', jasmine.any(String));
  });
});

describe('SvnAdapter', function() {
  var CORRUPTED_LOG_OUTPUT = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<log>',
    '<logentry',
    '   revision="344333">',
    '<author>developer1</author>',
    '<date>2016-10-31T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   action="M"',
    '   prop-mods="false"'
  ].join("\n");
  var GENERIC_LOG_OUTPUT = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<log>',
    '<logentry',
    '   revision="344333">',
    '<author>developer1</author>',
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
    '<author>developer2</author>',
    '<date>2016-10-31T08:30:40.400408Z</date>',
    '<paths>',
    '<path',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file"',
    '   action="M">/test/file2.rb</path>',
    '</paths>',
    '<msg>test message 456</msg>',
    '</logentry>',
    '<logentry',
    '   revision="344885">',
    '<author>alias_developer2</author>',
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
    '   prop-mods="false">/test/file5.js</path>',
    '</paths>',
    '<msg>test message 789</msg>',
    '</logentry>',
    '</log>'
  ].join("\n");

  var SINGLE_FILE_OUTPUT = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<log>',
    '<logentry',
    '    revision="477837">',
    '<author>mbenson</author>',
    '<date>2006-11-21T19:21:56.144109Z</date>',
    '<paths>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    'kind="file">/test/file1.java</path>',
    '</paths>',
    '<msg>test message 1.</msg>',
    '</logentry>',
    '<logentry',
    '   revision="477846">',
    '<author>mbenson</author>',
    '<date>2006-11-21T19:50:08.693187Z</date>',
    '<paths>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/test/file1.java</path>',
    '<path',
    '   action="M"',
    '   prop-mods="false"',
    '   text-mods="true"',
    '   kind="file">/test/file2.js</path>',
    '</paths>',
    '<msg>test message 2</msg>',
    '</logentry>',
    '</log>'
  ].join("\n");

  beforeEach(function() {
    spyOn(command.Command, 'ensure');

    this.subject = new SvnAdapter({ rootPath: '/root/dir' });
    this.timePeriod = new TimePeriod({
      start: moment('2015-08-22T14:51:42.123Z'), end: moment('2015-10-12T11:10:06.456Z')
    });
  });

  var buildLogStream = function(output) {
    var logStream = new stream.PassThrough();
    spyOn(command, 'stream').and.returnValue(logStream);

    _.each(output, logStream.push.bind(logStream));
    logStream.end();
  };

  it('ensures the svn command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('svn');
  });

  describe('.logStream()', function() {
    it('returns the svn log as a stream', function(done) {
      buildLogStream(GENERIC_LOG_OUTPUT);
      var result = '';

      this.subject.logStream(this.timePeriod)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual(GENERIC_LOG_OUTPUT);
          done();
        });

      expect(command.stream).toHaveBeenCalledWith('svn',
        ['log', '-v', '--xml', '-r{2015-08-22T14:51:42.123Z}:{2015-10-12T11:10:06.456Z}'], {cwd: '/root/dir'});
    });
  });

  describe('.commitMessagesStream()', function() {
    it('returns the svn commit messages as a stream', function(done) {
      buildLogStream(GENERIC_LOG_OUTPUT);

      var result = '';
      this.subject.commitMessagesStream(this.timePeriod)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual("test message 123\ntest message 456\ntest message 789\n");
          done();
        });

      expect(command.stream).toHaveBeenCalledWith('svn',
        ['log', '-v', '--xml', '-r{2015-08-22T14:51:42.123Z}:{2015-10-12T11:10:06.456Z}'], {cwd: '/root/dir'});
    });

    it('throws an error if the stream ends before the xml document is complete', function(done) {
      buildLogStream(CORRUPTED_LOG_OUTPUT);
      this.subject.commitMessagesStream(this.timePeriod)
        .on('error', done);
    });
  });

  describe('.showRevisionStream()', function() {
    it('returns the svn revision content as a stream', function() {
      spyOn(command, 'stream').and.returnValue('output-stream');
      var output = this.subject.showRevisionStream('qwe123', 'test/file');

      expect(output).toEqual('output-stream');
      expect(command.stream).toHaveBeenCalledWith('svn', ['cat', '-r', 'qwe123', 'test/file'], {cwd: '/root/dir'});
    });
  });

  describe('.revisions()', function() {
    it('returns the list of revisions for the given time period', function() {
      spyOn(command, 'run').and.returnValue(new Buffer(SINGLE_FILE_OUTPUT));
      var revisions = this.subject.revisions('test/file', this.timePeriod);

      expect(revisions).toEqual([
        { revisionId: '477837', date: '2006-11-21T19:21:56.144109Z' },
        { revisionId: '477846', date: '2006-11-21T19:50:08.693187Z' }
      ]);

      expect(command.run).toHaveBeenCalledWith('svn',
        ['log', '-v', '--xml', '-r{2015-08-22T14:51:42.123Z}:{2015-10-12T11:10:06.456Z}', 'test/file'], {cwd: '/root/dir'});
    });

    it('returns an empty list if the command output is empty', function() {
      spyOn(command, 'run').and.returnValue(new Buffer([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<log>',
        '</log>'
      ].join("\n")));
      var revisions = this.subject.revisions('test/file', this.timePeriod);

      expect(revisions).toEqual([]);
    });
  });
});
