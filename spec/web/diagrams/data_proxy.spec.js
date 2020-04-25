var Bluebird = require('bluebird');

var DataProxy = require('web/diagrams/data_proxy');

describe('DataProxy', function() {
  describe('default layout adapter', function() {
    it('it does not change the data for the layout', function() {
      var proxy = new DataProxy(null, function(data) {
        return 'transformed ' + data;
      });

      return proxy.processData('test-data')
        .then(function(result) {
          expect(result).toEqual('transformed test-data');
        });
    });
  });

  describe('default transform function', function() {
    it('returns the same data from the layout adapter', function() {
      var adapter = {
        toSeries: Bluebird.method(function(data) {
          return data * 2;
        })
      };
      var proxy = new DataProxy(adapter);

      return expect(proxy.processData(123)).resolves.toEqual(246);
    });
  });
});
