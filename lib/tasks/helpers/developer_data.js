var _ = require('lodash');

var AGGREGATION_ATTRIBUTE = {
  individual: 'name',
  team: 'team'
};

module.exports = function(context) {
  var aggregateRevisionsData = function(data) {
    return _.map(_.groupBy(data, 'path'), function(values, key) {
      return {
        path: key,
        children: _.reduce(values, function(array, entry) {
          var item = _.find(array, { 'name': entry.name });
          if (_.isUndefined(item)) {
            array.push({ name: entry.name, revisions: entry.revisions });
          } else {
            item.revisions += entry.revisions;
          }
          return array;
        }, [])
      };
    });
  };

  var normaliseAuthorData = function(effortAnalysisData, devInfoProperty) {
    return _.map(effortAnalysisData, function(entry) {
      return {
        path: entry.path,
        name: context.developerInfo.find(entry.author)[devInfoProperty],
        revisions: entry.revisions
      };
    });
  };

  this.aggregateBy = function(effortAnalysisData, type) {
    var normalisedData = normaliseAuthorData(effortAnalysisData, AGGREGATION_ATTRIBUTE[type]);

    return aggregateRevisionsData(normalisedData);
  };
};
