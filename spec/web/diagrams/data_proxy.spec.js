/*global require_src*/
var Bluebird  = require('bluebird');

var DataProxy = require_src('web/diagrams/data_proxy');

describe('DataProxy', function() {
  describe('default layout adapter', function() {
    it('it does not change the data for the layout', function(done) {
      var proxy = new DataProxy(null, function(data) {
        return 'transformed ' + data;
      });

      proxy.processData('test-data')
        .then(function(result) {
          expect(result).toEqual('transformed test-data');
          done();
        });
    });
  });

  describe('default transform function', function() {
    it('returns the same data from the layout adapter', function(done) {
      var adapter = {
        toSeries: Bluebird.method(function(data) {
          return data * 2;
        })
      };
      var proxy = new DataProxy(adapter);

      proxy.processData(123)
        .then(function(result) {
          expect(result).toEqual(246);
          done();
        });
    });
  });
});
