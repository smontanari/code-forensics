var vcs        = require_src('vcs'),
    vcsFactory = require_src('vcs/vcs_factory');

describe('vcs', function() {
  describe('vcs client', function() {
    beforeEach(function() {
      var mockAdapter = jasmine.createSpyObj('adapter', ['revisions', 'showRevisionStream', 'logStream', 'commitMessagesStream']);
      ['revisions', 'showRevisionStream', 'logStream', 'commitMessagesStream'].forEach(function(method) {
        mockAdapter[method].and.returnValue('output of: ' + method);
      });
      this.mockAdapter = mockAdapter;
      spyOn(vcsFactory, 'adapter').and.returnValue(mockAdapter);
    });

    it('delegates the functions call to the adapter', function() {
      var vcsClient = vcs.client('test repository');
      var mockAdapter = this.mockAdapter;

      ['revisions', 'showRevisionStream', 'logStream', 'commitMessagesStream'].forEach(function(method) {
        expect(vcsClient[method]('arg1', 'arg2')).toEqual('output of: ' + method);
        expect(mockAdapter[method]).toHaveBeenCalledWith('arg1', 'arg2');
      });

      expect(vcsFactory.adapter).toHaveBeenCalledWith('test repository');
      expect(vcsFactory.adapter.calls.count()).toEqual(1);
    });
  });

  describe('vcs logTransformer', function() {
    beforeEach(function() {
      this.mockTransformer = jasmine.createSpyObj('logTransformer', ['normaliseLogStream']);
      this.mockTransformer.normaliseLogStream.and.returnValue('output of: normaliseLogStream');
      spyOn(vcsFactory, 'logStreamTransformer').and.returnValue(this.mockTransformer);
    });

    it('delegates the functions call to the logTransformer', function() {
      var vcsLogTransformer = vcs.logTransformer('test repository', 'test developers info');

      expect(vcsLogTransformer.normaliseLogStream('arg1', 'arg2')).toEqual('output of: normaliseLogStream');
      expect(vcsLogTransformer.normaliseLogStream('arg3', 'arg4')).toEqual('output of: normaliseLogStream');
      expect(this.mockTransformer.normaliseLogStream).toHaveBeenCalledWith('arg1', 'arg2');
      expect(this.mockTransformer.normaliseLogStream).toHaveBeenCalledWith('arg3', 'arg4');

      expect(vcsFactory.logStreamTransformer).toHaveBeenCalledWith('test repository', 'test developers info');
      expect(vcsFactory.logStreamTransformer.calls.count()).toEqual(1);
    });
  });
});
