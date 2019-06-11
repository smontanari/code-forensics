var childProcess = require('child_process'),
    stream       = require('stream');

var command = require('command'),
    utils   = require('utils');

describe('Command.ensure()', function() {
  var commandDef;
  beforeEach(function() {
    commandDef = {};

    command.Command.definitions.getDefinition = jest.fn().mockReturnValue(commandDef);
  });

  describe('when an installCheck function is provided', function() {
    beforeEach(function() {
      commandDef.installCheck = jest.fn().mockName('command check');
    });

    it('uses the installCheck function to ensure the command is available', function() {
      command.Command.ensure('test-command');

      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
      expect(commandDef.installCheck).toHaveBeenCalled();
      expect(commandDef.installCheck.mock.instances).toEqual([utils.platformCheck]);
    });
  });

  describe('when no installCheck function is provided', function() {
    it('performs no check and no errors are returned', function() {
      command.Command.ensure('test-command');

      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
    });
  });
});

describe('Command.getConfig()', function() {
  var commandDef;
  describe('when a configuration is provided', function() {
    beforeEach(function() {
      commandDef = { config: { propA: 123 } };

      command.Command.definitions.getDefinition = jest.fn().mockReturnValue(commandDef);
    });

    it('returns the exposed configuration properties', function() {
      expect(command.Command.getConfig('test-command')).toEqual({ propA: 123 });
      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
    });
  });

  describe('when no configuration is provided', function() {
    beforeEach(function() {
      commandDef = {};

      command.Command.definitions.getDefinition = jest.fn().mockReturnValue(commandDef);
    });

    it('returns an enpty object', function() {
      expect(command.Command.getConfig('test-command')).toEqual({});
      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
    });
  });
});

describe('command', function() {
  var commandDef;
  beforeEach(function() {
    commandDef = {
      cmd: 'path/to/executable',
      args: ['--param1', '--param2', { '-a': 123 }, { '-b': 456 }]
    };

    command.Command.definitions.getDefinition = jest.fn().mockReturnValue(commandDef);
    process.stderr = jest.fn();
  });

  describe('.run()', function() {
    var cmdOutput;
    beforeEach(function() {
      childProcess.spawnSync = jest.fn().mockReturnValue({
        stdout: 'test output',
        stderr: 'test err'
      });

      cmdOutput = command.run('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});
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
      expect(cmdOutput).toBe('test output');
    });
  });

  describe('.stream()', function() {
    var spawnOutput, cmdStream;
    beforeEach(function() {
      spawnOutput = {
        stdout: new stream.Readable(),
        stderr: new stream.Readable()
      };
      childProcess.spawn = jest.fn().mockReturnValue(spawnOutput);
      spawnOutput.stdout.push('test output');
      spawnOutput.stdout.push(null);
      spawnOutput.stderr.push('test err');
      spawnOutput.stderr.push(null);
      spawnOutput.stderr.pipe = jest.fn();

      cmdStream = command.stream('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});
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
      expect(cmdStream.read().toString()).toEqual('test output');
    });

    it('dumps command stderr stream', function() {
      expect(spawnOutput.stderr.pipe).toHaveBeenCalledWith(expect.any(stream.Writable));
    });
  });

  describe('.createSync()', function() {
    it('returns a synchronous child process', function() {
      childProcess.spawnSync = jest.fn().mockReturnValue('sync process');

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
      childProcess.spawn = jest.fn().mockReturnValue('async process');

      var proc = command.createAsync('test-command', ['arg1', 'arg2'], {opt1: 789, opt2: 'abc'});

      expect(command.Command.definitions.getDefinition).toHaveBeenCalledWith('test-command');
      expect(proc).toEqual('async process');
      expect(childProcess.spawn).toHaveBeenCalledWith('path/to/executable', [
        '--param1', '--param2', '-a', 123, '-b', 456, 'arg1', 'arg2'
      ], { opt1: 789, opt2: 'abc' });
    });
  });
});
