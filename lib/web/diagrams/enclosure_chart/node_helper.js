var _  = require('lodash'),
    d3 = require('d3');

module.exports = function(config) {
  var self = this; //forced autobinding
  var colorScale = d3.scaleLinear()
    .domain([-1, 5])
    .range(config.style.nodeDepthColorRange)
    .interpolate(d3.interpolateHsl);

  this.nodeHiglighted = function(node) {
    return config.style.nodeHighlight && node.fullName() === config.style.nodeHighlight.name;
  };
  this.nodeWeight = function(node) {
    return node.data[config.series.calculatedWeightProperty];
  };
  this.nodeOffset = function(node) {
    return { x: node.x, y: node.y };
  };
  this.circleNodeFill = function(node) {
    if (self.nodeHiglighted(node)) { return config.style.nodeHighlight.color; }
    if (node.data[config.series.calculatedWeightProperty] > 0.0) { return config.style.weightedNodeColor; }
    if (node.children) { return colorScale(node.depth); }
  };
  this.circleNodeOpacity = function(node) {
    if (self.nodeHiglighted(node)) { return 1; }
    return node.data[config.series.calculatedWeightProperty];
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
    return node.data.name; //use nameProperty
  };
  this.textNodeClass = function(node) {
    var labelClasses = ['label'];
    if (node.children) {
      labelClasses.push('label-parent');
    } else {
      labelClasses.push('label-leaf');
      labelClasses.push((node.data[config.series.calculatedWeightProperty] > 0.4 ? 'label--heavy' : 'label--light'));
    }
    return labelClasses.join(' ');
  };
  this.nodeFocused = function(focus, node) {
    return focus === null || focus === undefined || node.parent === focus;
  };
  this.nodeTooltipTemplateArgs = function(node) {
    return [
      config.tooltipInfo.templateId,
      {
        name: node.fullName(),
        data: _.map(config.tooltipInfo.templateProperties, function(prop) {
          return { label: prop.label, value: node.data[prop.valueProperty] || 'n/a' };
        })
      }
    ];
  };
};
