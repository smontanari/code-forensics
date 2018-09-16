/*global require_src*/
var childProcess = require('child_process'),
    stream       = require('stream');

var command = require_src('command'),
    utils   = require_src('utils');

describe('Command.ensure()', function() {
  beforeEach(function() {
    this.commandDef = {};

    spyOn(command.Command.definitions, 'getDefinition').and.returnValue(this.commandDef);
  });

  describe('when an installCheck function is provided', function() {
    beforeEach(function() {
      this.commandDef.installCheck = jasmine.createSpy('command check');
    });

    it('uses the installCheck function to ensure the command is available', function() {
      command.Command.ensure('test-command');

      expect(this.commandDef.installCheck).toHaveBeenCalledWith();
      expect(this.commandDef.installCheck.calls.mostRecent().object).toBe(utils.platformCheck);
    });
  });

  describe('when no installCheck function is provided', function() {
    it('performs no check and no errors are returned', function() {
      command.Command.ensure('test-command');
    });
  });
});

describe('command', function() {
  beforeEach(function() {
    this.commandDef = {
      cmd: 'path/to/executable',
      args: ['--param1', '--param2', { '-a': 123 }, { '-b': 456 }]
    };

    spyOn(command.Command.definitions, 'getDefinition').and.returnValue(this.commandDef);
    spyOn(process.stderr, 'write');
  });

  describe('.run()', function() {
    beforeEach(function() {
      spyOn(childProcess, 'spawnSync').and.returnValue({
        stdout: 'test output',
        stderr: 'test err'
      });

      this.cmdOutput = command.run('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});
    });

    it('fetches the command definition', function() {
      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
    });

    it('spawns a sync process with the expected parameters', function() {
      expect(childProcess.spawnSync).toHaveBeenCalledWith('path/to/executable', [
        '--param1', '--param2', '-a', 123, '-b', 456, 'arg1', 'arg2'
      ], { opt1: 789, opt2: 'abc' });
    });

    it('returns the gitlog_analysis command output', function() {
      expect(this.cmdOutput).toBe('test output');
    });
  });

  describe('.stream()', function() {
    var spawnOutput;
    beforeEach(function() {
      spawnOutput = {
        stdout: new stream.Readable(),
        stderr: new stream.Readable()
      };
      spyOn(childProcess, 'spawn').and.returnValue(spawnOutput);
      spawnOutput.stdout.push('test output');
      spawnOutput.stdout.push(null);
      spawnOutput.stderr.push('test err');
      spawnOutput.stderr.push(null);
      spyOn(spawnOutput.stderr, 'pipe');

      this.cmdStream = command.stream('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});
    });

    it('fetches the command definition', function() {
      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
    });

    it('spawns the process with the expected parameters', function() {
      expect(childProcess.spawn).toHaveBeenCalledWith('path/to/executable', [
        '--param1', '--param2', '-a', 123, '-b', 456, 'arg1', 'arg2'
      ], { opt1: 789, opt2: 'abc' });
    });

    it('returns the gitlog_analysis command output stream', function() {
      expect(this.cmdStream.read().toString()).toEqual('test output');
    });

    it('dumps command stderr stream', function() {
      expect(spawnOutput.stderr.pipe).toHaveBeenCalledWith(jasmine.any(stream.Writable));
    });
  });

  describe('.createSync()', function() {
    it('returns a synchronous child process', function() {
      spyOn(childProcess, 'spawnSync').and.returnValue('sync process');

      var proc = command.createSync('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});

      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
      expect(proc).toEqual('sync process');
      expect(childProcess.spawnSync).toHaveBeenCalledWith('path/to/executable', [
        '--param1', '--param2', '-a', 123, '-b', 456, 'arg1', 'arg2'
      ], { opt1: 789, opt2: 'abc' });
    });
  });

  describe('.createAsync()', function() {
    it('returns an asynchronous child process', function() {
      spyOn(childProcess, 'spawn').and.returnValue('async process');

      var proc = command.createAsync('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});

      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
      expect(proc).toEqual('async process');
      expect(childProcess.spawn).toHaveBeenCalledWith('path/to/executable', [
        '--param1', '--param2', '-a', 123, '-b', 456, 'arg1', 'arg2'
      ], { opt1: 789, opt2: 'abc' });
    });
  });
});
