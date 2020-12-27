var _        = require('lodash'),
    stream   = require('stream'),
    Bluebird = require('bluebird');

jest.mock('api_middleware/load_reports');

var ApiMiddleware = require('api_middleware'),
    loadReports   = require('api_middleware/load_reports');

describe('ApiMiddleware', function() {
  var next = jest.fn();

  it('returns 1 middleware', function() {
    expect(new ApiMiddleware().middleware()).toHaveLength(1);
  });

  var verifyNoMiddlewareExecution = function(ctx) {
    beforeEach(function() {
      new ApiMiddleware().middleware()[0](ctx, next);
    });

    it('does not set a response', function() {
      expect(ctx.response).toEqual({});
    });

    it('passes control to the next middleware', function() {
      expect(next).toHaveBeenCalled();
    });
  };

  describe('/allReports', function() {
    describe('when method and path match the route', function() {
      var ctx = {
        method: 'GET',
        path: '/allReports'
      };
      var config = { reportDir: 'test/output' };
      var reportStreams = [];

      beforeEach(function() {
        ctx.response = {};
        reportStreams = [
          new stream.PassThrough({ objectMode: true }),
          new stream.PassThrough({ objectMode: true })
        ];
        loadReports.mockImplementation(function() {
          return reportStreams;
        });

        new ApiMiddleware().middleware(config)[0](ctx, next);
      });

      it('returns a successful json response', function() {
        expect(ctx.response.type).toEqual('json');
        expect(ctx.response.status).toEqual(200);
      });

      it('loads the reports from the given directory', function() {
        expect(loadReports).toHaveBeenCalledWith('test/output');
      });

      it('streams the reports as json', function() {
        return new Bluebird(function(done) {
          var output = new String();
          ctx.response.body
            .on('data', function(data) {
              output = output.concat(data);
            })
            .on('end', function() {
              expect(output.toString()).toEqual('[\n{"title":"report-0"},\n{"title":"report-1"}\n]\n');
              done();
            });

          _.each(reportStreams, function(s, index) {
            s.push({ title: 'report-' + index });
            s.end();
          });
        });
      });

      it('stops the middleware chain', function() {
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('when method does not match the route', function() {
      verifyNoMiddlewareExecution({
        method: 'POST',
        path: '/allReports',
        response: {}
      });
    });

    describe('when method does not match the path', function() {
      verifyNoMiddlewareExecution({
        method: 'GET',
        path: '/anotherPath',
        response: {}
      });
    });
  });
});
