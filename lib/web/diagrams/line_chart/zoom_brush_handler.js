var d3 = require('d3'),
    _  = require('lodash');

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var brushPanelChart = _.find(charts, { 'name': 'brushPanel' });

    var mainChartXAxis = mainChart.getComponentByName('xAxis');
    var mainChartZoom = mainChart.getComponentByName('zoom');
    var brushPanelChartXAxis = brushPanelChart.getComponentByName('xAxis');
    var brushPanelChartBrush = brushPanelChart.getComponentByName('brush');

    var diagramXScale = mainChartXAxis.axisBehavior.scale();
    var brushXScale = brushPanelChartXAxis.axisBehavior.scale();

    mainChartZoom.zoomBehavior.on('zoom', function() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
      var t = d3.event.transform;
      diagramXScale.domain(t.rescaleX(brushXScale).domain());
      mainChart.updateData();
      mainChartXAxis.repaint();
      brushPanelChartBrush.setActiveSelection(diagramXScale.range().map(t.invertX, t));
    });
    brushPanelChartBrush.brushBehavior.on('brush end', function() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      var s = d3.event.selection || model.scale.x2.range();
      diagramXScale.domain(s.map(brushXScale.invert, brushXScale));
      mainChart.updateData();
      mainChartXAxis.repaint();
      mainChartZoom.element.call(
        mainChartZoom.zoomBehavior.transform,
        d3.zoomIdentity.scale(820 / (s[1] - s[0])).translate(-s[0], 0)
      );
    });
  };
};
