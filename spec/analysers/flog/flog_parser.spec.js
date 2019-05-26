var FlogParser  = require('analysers/flog/flog_parser');

describe('FlogParser', function() {
  var content = '   643.7: flog total\n' +
                '   8.7: flog/method average\n' +
                '\n' +
                '   46.7: TestModuleName#method1\n' +
                '   41.4: TestModuleName#method2\n';

  it('returns the complexity stats for the module', function() {
    var output = new FlogParser().read(content);

    expect(output).toEqual({
      totalComplexity: 643.7,
      averageComplexity: 8.7,
      methodComplexity: [
        { name: 'TestModuleName#method1', complexity: 46.7 },
        { name: 'TestModuleName#method2', complexity: 41.4 }
      ]
    });
  });
});
