var espree = require('espree');
var Parser = require_src('analysers/escomplex/parser');

describe('Parser', function() {
  beforeEach(function() {
    this.subject = Parser.create('espree', { a: 123, b: 456 });
  });

  describe("when parsing with 'script' sourceType option is successful", function() {
    it('returns the result of the parse method', function() {
      spyOn(espree, 'parse').and.returnValue('test AST');

      expect(this.subject('test source', { c: 'zxc' })).toEqual('test AST');

      expect(espree.parse).toHaveBeenCalledWith('test source',
        { a: 123, b: 456, c: 'zxc', sourceType: 'script' });
    });
  });

  describe("when parsing with 'script' sourceType option fails", function() {
    it("returns the result of the parse method with the 'module' sourceType option", function() {
      spyOn(espree, 'parse').and.callFake(function(source, options) {
        if (options.sourceType === 'script') { throw 'Parsing error'; }
        return 'test AST';
      });

      expect(this.subject('test source', { c: 'zxc' })).toEqual('test AST');
      expect(espree.parse.calls.allArgs()).toEqual([
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'script' } ],
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'module' } ]
      ]);
    });
  });

  describe("when parsing with 'script' and 'module' sourceType option fails", function() {
    it("throws the last parsing error", function() {
      spyOn(espree, 'parse').and.callFake(function(source, options) {
        throw new Error('Parsing error');
      });

      expect(this.subject.bind(this.subject, 'test source', { c: 'zxc' })).toThrowError('Parsing error');

      expect(espree.parse.calls.allArgs()).toEqual([
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'script' } ],
        [ 'test source', { a: 123, b: 456, c: 'zxc', sourceType: 'module' } ]
      ]);
    });
  });
});
