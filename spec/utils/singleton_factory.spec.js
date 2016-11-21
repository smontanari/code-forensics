var SingletonFactory = require_src('utils/singleton_factory');

describe('SingletonFactory', function() {
  var MyObject = function(arg1, arg2) {
    this.attribue1 = arg1;
    this.attribue2 = arg2;
  };

  beforeEach(function() {
    this.subject = new SingletonFactory(MyObject);
  });

  it('returns an instance of MyObject', function() {
    var object = this.subject.instance();

    expect(object.constructor).toEqual(MyObject.prototype.constructor);
  });

  it('forwards the parameters to the constructor', function() {
    var object = this.subject.instance(123, 'qwe');

    expect(object.attribue1).toEqual(123);
    expect(object.attribue2).toEqual('qwe');
  });

  it('returns the same instance upon multiple invocations', function() {
    var object1 = this.subject.instance();
    var object2 = this.subject.instance();

    expect(object1).toBe(object2);
  });
});
