var objectTransformer = require('reporting/object_transformer');

describe('objectTransformer', function() {
  var obj;
  beforeEach(function() {
    obj = { a: 123, b: 456, c: 789 };
  });

  it('extracts a property by name', function() {
    expect(objectTransformer(obj, 'a')).toEqual({ a: 123 });
  });

  it('extracts a list of properties by name', function() {
    expect(objectTransformer(obj, ['a', 'c'])).toEqual({ a: 123, 'c': 789 });
  });

  it('transforms the object through a function', function() {
    expect(objectTransformer(obj, function(o) { return {sum: o.a + o.b}; })).toEqual({ sum: 579 });
  });

  it('returns the object itself', function() {
    expect(objectTransformer(obj)).toBe(obj);
  });
});
