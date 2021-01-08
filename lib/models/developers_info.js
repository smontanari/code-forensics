/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    CFValidationError = require('../runtime/errors').CFValidationError;

var verifyNoDuplicateNames = function(names) {
  _.each(names, function(name, index, coll) {
    if (_.findIndex(coll, function(n) { return n === name; }, index + 1) !== -1) {
      throw new CFValidationError('Duplicate developer name: ' + name);
    }
  });
};

var Team = function(name, memberList) {
  var members = (_.isUndefined(memberList) || _.isEmpty(memberList)) ? [] : memberList;
  this.name = name;

  this.findDeveloperName = function(name) {
    var index = _.findIndex(members, function(devName) {
      return (_.isArray(devName) && _.includes(devName, name)) || devName === name;
    });
    if (index !== -1) {
      var devName = members[index];
      return _.isArray(devName) ? _.first(devName) : devName;
    }
  };
};

module.exports = function(devInfoData) {
  var teams, defaultTeam;

  verifyNoDuplicateNames(_.flatMapDeep(_.values(devInfoData)));

  if (_.isPlainObject(devInfoData) && !_.isEmpty(devInfoData)) {
    teams = _.map(devInfoData, function(members, name) {
      return new Team(name, members);
    });
  } else {
    defaultTeam = new Team(undefined, devInfoData);
  }

  var findDeveloperInTeams = function(name) {
    var devInfo;
    _.each(teams, function(team) {
      var devName = team.findDeveloperName(name);
      if (devName) {
        devInfo = { name: devName, team: team.name };
        return false;
      }
    });
    return devInfo || { name: name, team: 'N/A (' + name + ')' };
  };

  this.hasTeamInfo = _.isArray(teams);

  this.find = function(name) {
    if (teams) {
      return findDeveloperInTeams(name);
    }
    return { name: defaultTeam.findDeveloperName(name) || name };
  };
};
