var WeightedTree = require('graph_support/weighted_tree');

describe('WeightedTree', function() {
  var subject;
  it('returns a one node tree with no weight', function() {
    var node = new WeightedTree('test/root', 'branch', {weightedProperty: 'value'}).rootNode();

    expect(node.name).toBeUndefined();
    expect(node.children).toEqual([]);
  });

  describe('for a normalised weight tree', function() {
    beforeEach(function() {
      subject = new WeightedTree('test/root', 'branch', {weightedProperty: 'value', normalised: true});
    });

    it('returns the root of a tree with the relative weight value', function() {
      [
        { branch: 'test/root/b1/item1', value: 2 },
        { branch: 'test/root/b1/item2', value: 5 },
        { branch: 'test/root/b2/item3', value: 7 }
      ].forEach(subject.withItem.bind(subject));

      var node = subject.rootNode();

      expect(node.getChildNode('b1/item1').weight).toBeCloseTo(0.286, 3);
      expect(node.getChildNode('b1/item2').weight).toBeCloseTo(0.714, 3);
      expect(node.getChildNode('b2/item3').weight).toBeCloseTo(1.0, 3);
    });
  });

  describe('for non normalised weight tree', function() {
    beforeEach(function() {
      subject = new WeightedTree('test/root', 'branch', {weightedProperty: 'value', weightPropertyName: 'load', normalised: false});
    });

    it('returns the root of a tree with the absolute weight value', function() {
      [
        { branch: 'test/root/b1/item1', value: 3 },
        { branch: 'test/root/b1/item2', value: 6 },
        { branch: 'test/root/b2/item3', value: 8 }
      ].forEach(subject.withItem.bind(subject));

      var node = subject.rootNode();

      expect(node.getChildNode('b1/item1').load).toEqual(3);
      expect(node.getChildNode('b1/item2').load).toEqual(6);
      expect(node.getChildNode('b2/item3').load).toEqual(8);
    });
  });
});
