var commandDefinition = require('analysers/code_maat/docker_command_definition'),
    command           = require('command');

var appConfig = require('runtime/app_config');
var helpers = require('../../jest_helpers');

describe.each([
  [{ image: 'test-codemaat-image', volume: '/test/volume/dir' }],
  [{ image: 'test-codemaat-image' }]
])('codemaat docker command definition', function(config) {
  var subject, mockCheck;
  beforeEach(function() {
    mockCheck = {
      verifyExecutable: jest.fn(),
      verifyConfigurationProperty: jest.fn()
    };
    process.cwd = jest.fn().mockReturnValue('test/current/dir');
    helpers.appConfigStub({
      basedir: '/test/project/dir',
      codeMaat: { docker: config }
    });
    commandDefinition();
    subject = command.Command.definitions.getDefinition('codemaat-docker');
  });

  it('defines the "codemaat-docker" command', function() {
    var expectedHostVolume = config.volume || 'test/current/dir';
    expect(subject).toEqual({
      cmd: 'docker',
      args: [
        'run',
        '--rm',
        '-v',
        expectedHostVolume + ':/data',
        'test-codemaat-image'
      ],
      installCheck: expect.any(Function),
      config: {
        containerVolume: '/data',
        hostVolume: expectedHostVolume
      }
    });
  });

  it('checks the docker executable', function() {
    subject.installCheck.apply(mockCheck);

    expect(mockCheck.verifyExecutable).toHaveBeenCalledWith('docker', expect.any(String));
  });

  it('checks the docker image configuration property', function() {
    subject.installCheck.apply(mockCheck);

    expect(mockCheck.verifyConfigurationProperty).toHaveBeenCalledWith(appConfig, 'codeMaat.docker.image', expect.any(String));
  });
});
