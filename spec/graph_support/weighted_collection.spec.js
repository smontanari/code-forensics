var _ = require('lodash');

var WeightedCollection = require_src('graph_support/weighted_collection');

describe('WeightedCollection', function() {
  describe('empty collection', function() {
    it('does nothing', function() {
      new WeightedCollection('value').assignWeights();
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
          _.each(collection, function(item) { wcoll.addItem(item); });
          wcoll.assignWeights();

          _.each([2, 5, 7], function(value, idx) {
            expect(collection[idx].weight).toEqual(value);
          });
        });
      });

      describe('normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection('value', true);
          _.each(collection, function(item) { wcoll.addItem(item); }, this);
          wcoll.assignWeights('testWeight');

          _.each([0.286, 0.714, 1.0], function(value, idx) {
            expect(collection[idx].testWeight).toBeCloseTo(value, 3);
          });
        });
      });
    });

    describe('with function based weight property', function() {
      describe('not normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection(function(item) { return item.value + 1; }, false);
          _.each(collection, function(item) { wcoll.addItem(item); }, this);
          wcoll.assignWeights('a_weight');

          _.each([3, 6, 8], function(value, idx) {
            expect(collection[idx].a_weight).toEqual(value);
          });
        });
      });

      describe('normalised collection', function() {
        it('assigns the weights corresponding to the property value', function() {
          var wcoll = new WeightedCollection(function(item) { return item.value + 1; }, true);
          _.each(collection, function(item) { wcoll.addItem(item); }, this);
          wcoll.assignWeights();

          _.each([0.375, 0.75, 1.0], function(value, idx) {
            expect(collection[idx].weight).toBeCloseTo(value, 3);
          });
        });
      });
    });
  });
});
