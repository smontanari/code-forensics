var objectTransformer = require_src('reporting/object_transformer');

describe('objectTransformer', function() {
  beforeEach(function() {
    this.obj = { a: 123, b: 456 };
  });

  it('extracts a property by name', function() {
    expect(objectTransformer.apply(this.obj, 'a')).toEqual({ a: 123 });
  });

  it('transforms the object through a function', function() {
    expect(objectTransformer.apply(this.obj, function(o) { return {sum: o.a + o.b}; })).toEqual({ sum: 579 });
  });

  it('returns the object itself', function() {
    expect(objectTransformer.apply(this.obj)).toBe(this.obj);
  });
});
