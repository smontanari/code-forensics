var Path = require('path'),
    os   = require('os');

var appConfig = require('runtime/app_config');

describe('appConfig', function() {
  it('returns always the root of this project as the basedir', function() {
    expect(appConfig.get('basedir')).toEqual(Path.resolve('.'));
  });

  it('returns always "git" as the version control system', function() {
    expect(appConfig.get('versionControlSystem')).toEqual('git');
  });

  it('returns the default max concurrency value', function() {
    expect(appConfig.get('maxConcurrency')).toEqual(os.cpus().length);
  });

  it('returns the default debug mode value', function() {
    expect(appConfig.get('debugMode')).toBe(false);
  });

  it('returns the default log enabled value', function() {
    expect(appConfig.get('logEnabled')).toBe(true);
  });

  it('returns the default server port value', function() {
    expect(appConfig.get('serverPort')).toEqual(3000);
  });
});
