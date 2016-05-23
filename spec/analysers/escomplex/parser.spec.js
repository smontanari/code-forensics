var Parser       = require_src('analysers/escomplex/parser'),
    parserConfig = require_src('analysers/escomplex/parser_config'),
    appConfig    = require_src('runtime/app_config');

describe('Parser', function() {
  beforeEach(function() {
    parserConfig.testParser = {
      parser: jasmine.createSpyObj('testParser', ['parse']),
      defaultOptions: { b: 789, c: 'zxc' }
    };
    appConfig.javascriptParser = { name: 'testParser', options: { a: 123, b: 456 } };

    this.subject = Parser.create();
  });

  describe("when parsing with 'script' sourceType option is successful", function() {
    it('returns the result of the parse method', function() {
      parserConfig.testParser.parser.parse.and.returnValue('test AST');

      expect(this.subject.parse('test source')).toEqual('test AST');

      expect(parserConfig.testParser.parser.parse).toHaveBeenCalledWith('test source',
        { a: 123, b: 456, c: 'zxc', sourceType: 'script' });
    });
  });

  describe("when parsing with 'script' sourceType option fails", function() {
    it("returns the result of the parse method with the 'module' sourceType option", function() {
      parserConfig.testParser.parser.parse.and.callFake(function(source, options) {
        if (options.sourceType === 'script') { throw 'Parsing error'; }
        return 'test AST';
      });

      expect(this.subject.parse('test source')).toEqual('test AST');

      expect(parserConfig.testParser.parser.parse.calls.allArgs()).toEqual([
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'script' } ],
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'module' } ]
      ]);
    });
  });

  describe("when parsing with 'script' and 'module' sourceType option fails", function() {
    it("throws the last parsing error", function() {
      parserConfig.testParser.parser.parse.and.callFake(function(source, options) {
        throw new Error('Parsing error');
      });

      expect(this.subject.parse.bind(this.subject, 'test source')).toThrowError('Parsing error');

      expect(parserConfig.testParser.parser.parse.calls.allArgs()).toEqual([
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'script' } ],
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'module' } ]
      ]);
    });
  });
});
