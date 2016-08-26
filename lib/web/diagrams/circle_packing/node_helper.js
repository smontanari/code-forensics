var _ = require('lodash');

module.exports = function(config) {
  var self = this; //forced autobinding

  this.nodeValue = function(node) {
    return node[config.series.valueProperty];
  };
  this.nodeHiglighted = function(node) {
    return config.style.nodeHighlight && node.fullName() === config.style.nodeHighlight.name;
  };
  this.nodeWeight = function(node) {
    return node[config.series.calculatedWeightProperty]
  };
  this.nodeVisible = function(weightThreshold, valueThreshold, node) {
    var isNodeAboveWeightThreshold =
    _.isUndefined(node[config.series.calculatedWeightProperty]) ||
    _.isNumber(node[config.series.calculatedWeightProperty]) && node[config.series.calculatedWeightProperty] >= weightThreshold;

    var isNodeAboveValueThreshold = _.isNumber(node.value) && node.value >= valueThreshold;

    return node.isRoot() || (isNodeAboveWeightThreshold && isNodeAboveValueThreshold);
  };
  this.nodeOffset = function(node) {
    return { x: node.x, y: node.y };
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
    return node.isRoot() ? 'node node--root' : node.isLeaf() ? 'node node--leaf' : 'node';
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
      name: node.fullName(),
      valueProperty: { label: config.series.valueLabel, value: node[config.series.valueProperty] },
      weightProperty: { label: config.series.weightLabel, value: (node[config.series.weightProperty] || 'n/a') }
    };
  };
};
