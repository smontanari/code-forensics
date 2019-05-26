var vcs        = require('vcs'),
    vcsFactory = require('vcs/vcs_factory');

describe('vcs', function() {
  describe('vcs client', function() {
    var mockAdapter;
    beforeEach(function() {
      mockAdapter = {};
      ['revisions', 'showRevisionStream', 'logStream', 'commitMessagesStream'].forEach(function(method) {
        mockAdapter[method] = jest.fn().mockReturnValue('output of: ' + method);
      });
      vcsFactory.adapter = jest.fn().mockReturnValue(mockAdapter);
    });

    it('delegates the functions call to the adapter', function() {
      var vcsClient = vcs.client('test repository');

      ['revisions', 'showRevisionStream', 'logStream', 'commitMessagesStream'].forEach(function(method) {
        expect(vcsClient[method]('arg1', 'arg2')).toEqual('output of: ' + method);
        expect(mockAdapter[method]).toHaveBeenCalledWith('arg1', 'arg2');
      });

      expect(vcsFactory.adapter).toHaveBeenCalledWith('test repository');
      expect(vcsFactory.adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe('vcs logTransformer', function() {
    var mockTransformer;
    beforeEach(function() {
      mockTransformer = {
        normaliseLogStream: jest.fn().mockReturnValue('output of: normaliseLogStream')
      };
      vcsFactory.logStreamTransformer = jest.fn().mockReturnValue(mockTransformer);
    });

    it('delegates the functions call to the logTransformer', function() {
      var vcsLogTransformer = vcs.logTransformer('test repository', 'test developers info');

      expect(vcsLogTransformer.normaliseLogStream('arg1', 'arg2')).toEqual('output of: normaliseLogStream');
      expect(vcsLogTransformer.normaliseLogStream('arg3', 'arg4')).toEqual('output of: normaliseLogStream');
      expect(mockTransformer.normaliseLogStream).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockTransformer.normaliseLogStream).toHaveBeenCalledWith('arg3', 'arg4');

      expect(vcsFactory.logStreamTransformer).toHaveBeenCalledWith('test repository', 'test developers info');
      expect(vcsFactory.logStreamTransformer).toHaveBeenCalledTimes(1);
    });
  });
});
