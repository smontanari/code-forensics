var commandDefinition = require('analysers/code_maat/java_command_definition'),
    command           = require('command');

var helpers = require('../../jest_helpers');

describe('codemaat java command definition', function() {
  var subject, mockCheck;
  beforeEach(function() {
    mockCheck = {
      verifyExecutable: jest.fn(),
      verifyPackage: jest.fn(),
      verifyFile: jest.fn()
    };
  });

  describe('with default configuration', function() {
    beforeEach(function() {
      commandDefinition();
      subject = command.Command.definitions.getDefinition('codemaat');
    });

    it('defines the "codemaat" command', function() {
      expect(subject).toEqual({
        cmd: 'java',
        args: [
          '-Djava.awt.headless=true',
          { '-jar': expect.stringMatching('code-maat-1.0.1-standalone.jar') }
        ],
        installCheck: expect.any(Function)
      });
    });
  });

  describe('with custom configuration', function() {
    beforeEach(function() {
      helpers.appConfigStub({ codeMaat: { packageFile: '/some/test/codemaat-package.jar' } });
      commandDefinition();
      subject = command.Command.definitions.getDefinition('codemaat');
    });

    afterEach(function() {
      helpers.appConfigRestore();
    });

    it('defines the "codemaat" command', function() {
      expect(subject).toEqual({
        cmd: 'java',
        args: [
          '-Djava.awt.headless=true',
          { '-jar': '/some/test/codemaat-package.jar' }
        ],
        installCheck: expect.any(Function)
      });
    });
  });

  it('checks the java executable', function() {
    subject.installCheck.apply(mockCheck);

    expect(mockCheck.verifyExecutable).toHaveBeenCalledWith('java', expect.any(String));
    expect(mockCheck.verifyFile).toHaveBeenCalledWith('/some/test/codemaat-package.jar', expect.any(String));
  });
});
