var _ = require('lodash');

var verifyNoDuplicateNames = function(names) {
  _.each(names, function(name, index, coll) {
    if (_.findIndex(coll, function(n) { return n === name; }, index + 1) !== -1) {
      throw new Error('Duplicate developer name: ' + name);
    }
  });
};

var Team = function(name, members) {
  this.name = name;

  this.findDeveloper = function(name) {
    var index = _.findIndex(members, function(devName) {
      return (_.isArray(devName) && _.includes(devName, name)) || devName === name;
    });
    if (index !== -1) {
      var devName = members[index];
      return _.isArray(devName) ? _.first(devName) : devName;
    }
  };
};

module.exports = function(teamsComposition) {
  verifyNoDuplicateNames(_.flatMapDeep(_.values(teamsComposition)));
  var teams = _.map(teamsComposition, function(members, name) {
    return new Team(name, members);
  });

  this.find = function(name) {
    var devInfo;
    _.each(teams, function(team) {
      var devName = team.findDeveloper(name);
      if (devName) {
        devInfo = { name: devName, team: team.name };
        return false;
      }
    });
    return devInfo || { name: name, team: 'N/A (' + name + ')' };
  };
};
