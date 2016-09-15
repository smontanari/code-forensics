var objectTransformer = require_src('reporting/object_transformer');

describe('objectTransformer', function() {
  beforeEach(function() {
    this.obj = { a: 123, b: 456, c: 789 };
  });

  it('extracts a property by name', function() {
    expect(objectTransformer(this.obj, 'a')).toEqual({ a: 123 });
  });

  it('extracts a list of properties by name', function() {
    expect(objectTransformer(this.obj, ['a', 'c'])).toEqual({ a: 123, 'c': 789 });
  });

  it('transforms the object through a function', function() {
    expect(objectTransformer(this.obj, function(o) { return {sum: o.a + o.b}; })).toEqual({ sum: 579 });
  });

  it('returns the object itself', function() {
    expect(objectTransformer(this.obj)).toBe(this.obj);
  });
});
