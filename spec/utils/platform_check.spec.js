var shell = require('shelljs'),
    fs    = require('fs');

var platformCheck = require('utils/platform_check');

jest.mock('fs');

describe('platformCheck', function() {
  beforeEach(function() {
    ['which', 'exec', 'echo', 'exit'].forEach(function(method) {
      shell[method] = jest.fn();
    });
  });

  describe('.verifyExecutable()', function() {
    it('succeeds if the executable exists', function() {
      shell.which.mockReturnValue(true);

      platformCheck.verifyExecutable('test-command', 'test error');

      expect(shell.which).toHaveBeenCalledWith('test-command');
      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the executable is not found', function() {
      shell.which.mockReturnValue(false);

      platformCheck.verifyExecutable('test-command', 'test error');

      expect(shell.which).toHaveBeenCalledWith('test-command');
      expect(shell.echo).toHaveBeenCalledWith(expect.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('.verifyPackage()', function() {
    it('succeeds if the command output matches the expected value', function() {
      shell.exec.mockReturnValue({ stdout: 'test result ' });

      platformCheck.verifyPackage('test-command', 'test result', 'test error');

      expect(shell.exec).toHaveBeenCalledWith('test-command', { silent: true });
      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the command output does not match the expected value', function() {
      shell.exec.mockReturnValue({ stdout: 'different result ' });

      platformCheck.verifyPackage('test-command', 'test result', 'test error');

      expect(shell.exec).toHaveBeenCalledWith('test-command', { silent: true });
      expect(shell.echo).toHaveBeenCalledWith(expect.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('.verifyFile()', function() {
    it('succeeds if the file exists', function() {
      fs.existsSync.mockReturnValue(true);

      platformCheck.verifyFile('/some/valid/file', 'test error');

      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the file is not found', function() {
      fs.existsSync.mockReturnValue(false);

      platformCheck.verifyFile('/some/valid/file', 'test error');

      expect(shell.echo).toHaveBeenCalledWith(expect.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('.verifyConfigurationProperty()', function() {
    var mockAppConfig;
    beforeEach(function() {
      mockAppConfig = { get: jest.fn() };
    });

    it('succeeds if the property exists', function() {
      mockAppConfig.get.mockReturnValue('some-value');
      platformCheck.verifyConfigurationProperty(mockAppConfig, 'some.property', 'test error');

      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the property does not exist', function() {
      platformCheck.verifyConfigurationProperty(mockAppConfig, 'some.property', 'test error');

      expect(shell.echo).toHaveBeenCalledWith(expect.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });
});
