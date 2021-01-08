/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

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
        { name: context.developersInfo.find(entry.author)[devInfoProperty] }
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

  this.aggregateIndividualEffortOwnership = function(effortAnalysisData) {
    return aggregateData(effortAnalysisData, 'individual', 'revisions');
  };

  this.aggregateTeamEffortOwnership = function(effortAnalysisData) {
    if (context.developersInfo.hasTeamInfo) {
      return aggregateData(effortAnalysisData, 'team', 'revisions');
    }
  };

  this.aggregateIndividualCodeOwnership = function(ownershipAnalysisData) {
    return aggregateData(ownershipAnalysisData, 'individual', 'addedLines');
  };

  this.aggregateTeamCodeOwnership = function(ownershipAnalysisData) {
    if (context.developersInfo.hasTeamInfo) {
      return aggregateData(ownershipAnalysisData, 'team', 'addedLines');
    }
  };
};
