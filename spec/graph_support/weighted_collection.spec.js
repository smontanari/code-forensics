var _ = require('lodash');

var WeightedCollection = require('graph_support/weighted_collection');

describe('WeightedCollection', function() {
  describe('empty collection', function() {
    it('does nothing', function() {
      expect(
        function() { new WeightedCollection('value').assignWeights(); }
      ).not.toThrow();
    });
  });

  describe('non empty collection', function() {
    var collection;
    beforeEach(function() {
      collection = [
        { aProperty: 'qwe', value: 2 },
        { aProperty: 'asd', value: 5 },
        { aProperty: 'zxc', value: 7 }
      ];
    });

    describe('with name based weight property', function() {
      describe('not normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection('value');
          collection.forEach(wcoll.addItem.bind(wcoll));
          wcoll.assignWeights();

          [2, 5, 7].forEach(function(value, idx) {
            expect(collection[idx].weight).toEqual(value);
          });
        });
      });

      describe('normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection('value', true);
          collection.forEach(wcoll.addItem.bind(wcoll));
          wcoll.assignWeights('testWeight');

          [0.286, 0.714, 1.0].forEach(function(value, idx) {
            expect(collection[idx].testWeight).toBeCloseTo(value, 3);
          });
        });
      });
    });

    describe('with function based weight property', function() {
      describe('not normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection(function(item) { return item.value + 1; }, false);
          collection.forEach(wcoll.addItem.bind(wcoll));
          wcoll.assignWeights('a_weight');

          [3, 6, 8].forEach(function(value, idx) {
            expect(collection[idx].a_weight).toEqual(value);
          });
        });
      });

      describe('normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection(function(item) { return item.value + 1; }, true);
          collection.forEach(wcoll.addItem.bind(wcoll));
          wcoll.assignWeights();

          [0.375, 0.75, 1.0].forEach(function(value, idx) {
            expect(collection[idx].weight).toBeCloseTo(value, 3);
          });
        });
      });
    });

    describe('when the weight cannot be determined', function() {
      it('assigns a value of 0 to every item in the collection', function() {
        var wcoll = new WeightedCollection('wrongProperty');
        collection.forEach(wcoll.addItem.bind(wcoll));
        wcoll.assignWeights();

        expect(_.every(collection, { 'weight': 0 })).toBe(true);
      });
    });
  });
});
