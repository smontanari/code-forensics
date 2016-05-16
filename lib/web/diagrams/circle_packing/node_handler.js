require('d3');
var _ = require('lodash');

module.exports = function(options) {
  var self = this; //forced autobinding

  var styleConfig = options.style;
  var seriesConfig = options.series;
  var valueFilter = options.valueFilter;
  var weightFilter = options.weightFilter;

  var colorScale = d3.scale.linear()
    .domain([-1, 5])
    .range([styleConfig.colorRange.from, styleConfig.colorRange.to])
    .interpolate(d3.interpolateHcl);

  this.nodeValue = function(node) {
    return node[seriesConfig.valueProperty];
  };
  this.nodeFullName = function(node) {
    var names = [];
    var currentNode = node;
    _.times(node.depth, function() {
      names.push(currentNode.name);
      currentNode = currentNode.parent;
    })
    return names.reverse().join("/");
  };
  this.leafNode = function(node) {
    return _.isObject(node.parent) && _.isEmpty(node.children);
  };
  this.nodeHiglighted = function(node) {
    return styleConfig.nodeHighlight && self.nodeFullName(node) === styleConfig.nodeHighlight.name;
  };
  this.nodeVisible = function(node) {
    return self.nodeHiglighted(node) ||
      (_.isUndefined(node[seriesConfig.calculatedWeightProperty]) ||
      node[seriesConfig.calculatedWeightProperty] >= weightFilter.changeValue()) &&
      node.value >= valueFilter.changeValue();
  };
  this.nodeTransform = function(node) {
    return "translate(" + node.x + "," + node.y + ")";
  };
  this.circleNodeDisplay = function(node) {
    return self.nodeVisible(node) ? "block" : "none";
  };
  this.circleNodeFill = function(node) {
    if (self.nodeHiglighted(node)) { return styleConfig.nodeHighlight.color; }
    return node[seriesConfig.calculatedWeightProperty] > 0.0 ? styleConfig.colorValues.weightColor : node.children ? colorScale(node.depth) : styleConfig.colorValues.noColor;
  };
  this.circleNodeOpacity = function(node) {
    if (self.nodeHiglighted(node)) { return 1; }
    return node[seriesConfig.calculatedWeightProperty];
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
    return self.nodeVisible(node) ? node.name : null;
  };
  this.textNodeDisplay = function(parentNode, node){
    return self.nodeFocused(parentNode, node) && self.nodeVisible(node) ? "inline" : "none";
  };
  this.textNodeClass = function(node) {
    var labelClasses = ['label'];
    if (node.children) {
      labelClasses.push('label-parent');
    } else {
      labelClasses.push('label-leaf');
      labelClasses.push((node[seriesConfig.calculatedWeightProperty] > 0.4 ? "label--heavy" : "label--light"));
    }
    return labelClasses.join(' ');
  };
  this.nodeFocused = function(focus, node) {
    return focus === null || focus === undefined || node.parent === focus;
  };
  this.nodeData = function(node) {
    return {
      name: self.nodeFullName(node),
      valueProperty: { label: seriesConfig.valueLabel, value: node[seriesConfig.valueProperty] },
      weightProperty: { label: seriesConfig.weightLabel, value: (node[seriesConfig.weightProperty] || 'n/a') }
    };
  };
};
