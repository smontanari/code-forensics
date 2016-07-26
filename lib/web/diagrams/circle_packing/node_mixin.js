var _ = require('lodash');

module.exports = {
 fullName: function() {
    var names = [];
    var currentNode = this;
    _.times(this.depth, function() {
      names.push(currentNode.name);
      currentNode = currentNode.parent;
    });
    return names.reverse().join("/");
  },
  hasLayout: function() {
    return _.isNumber(this.r) && _.isNumber(this.x) && _.isNumber(this.y);
  },
  isRoot: function() {
    return _.isUndefined(this.parent);
  },
  isLeaf: function() {
    return _.isEmpty(this.children);
  }
};
