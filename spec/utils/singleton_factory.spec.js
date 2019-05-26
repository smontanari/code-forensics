var SingletonFactory = require('utils/singleton_factory');

describe('SingletonFactory', function() {
  var MyObject = function(arg1, arg2) {
    this.attribue1 = arg1;
    this.attribue2 = arg2;
  };

  var MyParameter = function(value) {
    this.value = value;

    this.method = function() {};
  };

  var subject;
  beforeEach(function() {
    subject = new SingletonFactory(MyObject);
  });

  it('returns an instance of MyObject', function() {
    var object = subject.instance();

    expect(object.constructor).toEqual(MyObject.prototype.constructor);
  });

  it('forwards the parameters to the constructor', function() {
    var object = subject.instance(123, 'qwe');

    expect(object.attribue1).toEqual(123);
    expect(object.attribue2).toEqual('qwe');
  });

  it('returns the same instance upon multiple invocations with same parameters', function() {
    var object1 = subject.instance();
    var object2 = subject.instance();
    var object3 = subject.instance(123, 'qwe');
    var object4 = subject.instance(123, 'qwe');
    var object5 = subject.instance({ a: 456, b: 'qwe' });
    var object6 = subject.instance({ a: 456, b: 'qwe' });
    var obj = new MyParameter([456]);
    var object7 = subject.instance(obj);
    var object8 = subject.instance(obj);

    expect(object1).toBe(object2);
    expect(object3).toBe(object4);
    expect(object5).toBe(object6);
    expect(object7).toBe(object8);
  });

  it('returns different instances upon multiple invocations with different parameters', function() {
    var object1 = subject.instance();
    var object2 = subject.instance(123, 'qwe');
    var object3 = subject.instance({ a: 456, b: 'qwe' });
    var object4 = subject.instance(new MyParameter([123]));
    var object5 = subject.instance(new MyParameter([123]));

    expect(object1).not.toBe(object2);
    expect(object1).not.toBe(object3);
    expect(object2).not.toBe(object3);
    expect(object2).not.toBe(object4);
    expect(object3).not.toBe(object4);
    expect(object4).not.toBe(object5);
  });
});
