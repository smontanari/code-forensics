module.exports = {
  haveSamePath: function(item1, item2) {
    return item1.path === item2.path;
  },
  isCoupledWith: function(targetPath, item) {
    return item.path === targetPath || item.coupledPath === targetPath;
  },
  areCoupledWith: function(targetPath, item1, item2) {
    return (item2.path.match(item1.coupledPath) && targetPath === item1.path) ||
           (item2.path.match(item1.path) && targetPath === item1.coupledPath);
  }
};
