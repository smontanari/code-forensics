var _ = require('lodash');

module.exports = function(config) {
  var self = this; //forced autobinding

  this.nodeValue = function(node) {
    return node[config.series.valueProperty];
  };
  this.nodeFullName = function(node) {
    var names = [];
    var currentNode = node;
    _.times(node.depth, function() {
      names.push(currentNode.name);
      currentNode = currentNode.parent;
    });
    return names.reverse().join("/");
  };
  this.hasLayout = function(node) {
    return _.isNumber(node.r) && _.isNumber(node.x) && _.isNumber(node.y);
  };
  this.leafNode = function(node) {
    return _.isObject(node.parent) && _.isEmpty(node.children);
  };
  this.nodeHiglighted = function(node) {
    return config.style.nodeHighlight && self.nodeFullName(node) === config.style.nodeHighlight.name;
  };
  this.nodeVisible = function(weightThreshold, valueThreshold, node) {
    return (_.isUndefined(node[config.series.calculatedWeightProperty]) ||
      node[config.series.calculatedWeightProperty] >= weightThreshold) &&
      node.value >= valueThreshold;
  };
  this.nodeTransform = function(node) {
    return "translate(" + node.x + "," + node.y + ")";
  };
  this.circleNodeFill = function(node) {
    if (self.nodeHiglighted(node)) { return config.style.nodeHighlight.color; }
    return node[config.series.calculatedWeightProperty] > 0.0 ? config.style.colorValues.weightColor : node.children ? config.style.colorScale(node.depth) : config.style.colorValues.noColor;
  };
  this.circleNodeOpacity = function(node) {
    if (self.nodeHiglighted(node)) { return 1; }
    return node[config.series.calculatedWeightProperty];
  };
  this.circleNodeClass = function(node) {
    return node.parent ? node.children ? "node" : "node node--leaf" : "node node--root";
  };
  this.circleNodeRadius = function(node) {
    return node.r;
  };
  this.textNodeOpacity = function(parentNode, node) {
    return self.nodeFocused(parentNode, node) ? 1 : 0;
  };
  this.textNodeContent = function(node) {
    return node.name;
  };
  this.textNodeClass = function(node) {
    var labelClasses = ['label'];
    if (node.children) {
      labelClasses.push('label-parent');
    } else {
      labelClasses.push('label-leaf');
      labelClasses.push((node[config.series.calculatedWeightProperty] > 0.4 ? "label--heavy" : "label--light"));
    }
    return labelClasses.join(' ');
  };
  this.nodeFocused = function(focus, node) {
    return focus === null || focus === undefined || node.parent === focus;
  };
  this.nodeData = function(node) {
    return {
      name: self.nodeFullName(node),
      valueProperty: { label: config.series.valueLabel, value: node[config.series.valueProperty] },
      weightProperty: { label: config.series.weightLabel, value: (node[config.series.weightProperty] || 'n/a') }
    };
  };
};
