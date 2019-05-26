var XmlUtils = require('utils/xml_utils');

describe('XmlUtils', function() {
  describe('nodeWithName()', function() {
    it('returns a resolver for the xml tag with the given name', function() {
      var fn = XmlUtils.nodeWithName('test_name');

      expect(fn({ name: 'test_name' })).toEqual(true);
      expect(fn({ name: 'another_name' })).toEqual(false);
    });
  });

  describe('nodeText()', function() {
    it('returns text content of the given xml node', function() {
      var node = {
        children: [
          { type: 'attribute', value: 'test_attribute' },
          { type: 'text', value: 'test_text' }
        ]
      };

      expect(XmlUtils.nodeText(node)).toEqual('test_text');
    });
  });
});
