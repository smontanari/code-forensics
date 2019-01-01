/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3');

module.exports = function(simulation) {
  var dragstarted = function(d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  };

  var dragged = function(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };

  var dragended = function(d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  };

  this.bindTo = function(nodes) {
    nodes.call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));
  };
};
