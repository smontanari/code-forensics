require('d3Tip');

var mustacheHelper = require('../../helpers/mustache_helper.js');

module.exports = function(nodeHelper) {
  mustacheHelper.addTemplate('tooltip-template', 'tooltip-template.html');

  var initTip = function(model) {
    return d3.tip()
      .attr('class', 'd3-tip circle-packing-diagram')
      .html(function(node) {
        if (nodeHelper.nodeFocused(model.currentFocus(), node) && node.isLeaf()) {
          return mustacheHelper.renderTemplate('tooltip-template', nodeHelper.nodeData(node));
        }
      });
  };

  this.bindTo = function(svgObject, model) {
    var tip = initTip(model);

    svgObject.call(tip);
    svgObject.selectAll("circle")
      .on('mouseover', function(node) {
        if (nodeHelper.nodeFocused(model.currentFocus(), node) && node.isLeaf()) {
          tip.show(node);
        }
      })
      .on('mouseout', tip.hide);
  };
};
