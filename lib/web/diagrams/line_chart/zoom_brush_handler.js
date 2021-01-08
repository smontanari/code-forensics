/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

module.exports = function(options) {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var brushPanelChart = _.find(charts, { 'name': 'brushPanel' });

    var mainChartXAxis = mainChart.getComponentByName('xAxis').component;
    var mainChartZoom = mainChart.getComponentByName('zoom').component;
    var brushPanelChartXAxis = brushPanelChart.getComponentByName('xAxis').component;
    var brushPanelChartBrush = brushPanelChart.getComponentByName('brush').component;

    var diagramXScale = mainChartXAxis.axisBehavior.scale();
    var brushXScale = brushPanelChartXAxis.axisBehavior.scale();

    mainChartZoom.zoomBehavior.on('zoom', function(event) {
      if (!event.sourceEvent) return;
      var t = event.transform;
      diagramXScale.domain(t.rescaleX(brushXScale).domain());
      mainChart.updateComponents();
      mainChartXAxis.repaint();
      brushPanelChartBrush.setActiveSelection(diagramXScale.range().map(t.invertX, t));
    });
    brushPanelChartBrush.brushBehavior.on('brush end', function(event) {
      if (!event.sourceEvent) return;
      var s = event.selection || model.scale.x2.range();
      diagramXScale.domain(s.map(brushXScale.invert, brushXScale));
      mainChart.updateComponents();
      mainChartXAxis.repaint();
      mainChartZoom.element.call(
        mainChartZoom.zoomBehavior.transform,
        d3.zoomIdentity.scale(options.zoomWidth / (s[1] - s[0])).translate(-s[0], 0)
      );
    });
  };
};
