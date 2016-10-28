var _ = require('lodash');

var AGGREGATION_DATA_ATTRIBUTE = {
  individual: 'name',
  team: 'team'
};

var AGGREGATION_REPORT_ATTRIBUTE = {
  individual: 'authors',
  team: 'teams'
};

module.exports = function(context) {
  var normaliseAuthorData = function(data, devInfoProperty) {
    return _.map(data, function(entry) {
      return _.assign(
        _.omit(entry, 'author'),
        { name: context.developerInfo.find(entry.author)[devInfoProperty] }
      );
    });
  };

  var extendWithOwnershipProperty = function(array, aggregateProperty) {
    var totalAggregate = _.reduce(array, function(sum, entry) {
      return sum + entry[aggregateProperty];
    }, 0);
    _.each(array, function(entry) {
      entry.ownership = Math.round(100 * entry[aggregateProperty]/totalAggregate);
    });
  };

  var aggregateData = function(analysisData, type, aggregateProperty) {
    var normalisedData = normaliseAuthorData(analysisData, AGGREGATION_DATA_ATTRIBUTE[type]);

    return _.map(_.groupBy(normalisedData, 'path'), function(values, key) {
      var aggregatedData = _.reverse(_.sortBy(
        _.reduce(values, function(array, entry) {
          var item = _.find(array, { 'name': entry.name });
          if (_.isUndefined(item)) {
            array.push(_.pick(entry, ['name', aggregateProperty]));
          } else {
            item[aggregateProperty] += entry[aggregateProperty];
          }
          return array;
        }, []), aggregateProperty
      ));

      extendWithOwnershipProperty(aggregatedData, aggregateProperty);

      return _.tap({ path: key }, function(object) {
        object[AGGREGATION_REPORT_ATTRIBUTE[type]] = aggregatedData;
      });
    });
  };


  this.aggregateEffortOwnershipBy = function(effortAnalysisData, type) {
    return aggregateData(effortAnalysisData, type, 'revisions');
  };

  this.aggregateCodeOwnershipBy = function(ownershipAnalysisData, type) {
    return aggregateData(ownershipAnalysisData, type, 'addedLines');
  };
};
