var d3 = require('d3'),
    _  = require('lodash');

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var brushPanelChart = _.find(charts, { 'name': 'brushPanel' });

    var mainChartAxes = mainChart.getComponentByName('axes');
    var mainChartZoom = mainChart.getComponentByName('zoom');
    var brushPanelChartAxes = brushPanelChart.getComponentByName('axes');
    var brushPanelChartBrush = brushPanelChart.getComponentByName('brush');

    var diagramXScale = mainChartAxes.getAxisBehavior('X').scale();
    var brushXScale = brushPanelChartAxes.getAxisBehavior('X').scale();

    mainChartZoom.zoomBehavior.on('zoom', function() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
      var t = d3.event.transform;
      diagramXScale.domain(t.rescaleX(brushXScale).domain());
      mainChart.updateData();
      mainChartAxes.repaint('X');
      brushPanelChartBrush.setActiveSelection(diagramXScale.range().map(t.invertX, t));
    });
    brushPanelChartBrush.brushBehavior.on('brush end', function() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      var s = d3.event.selection || model.scale.x2.range();
      diagramXScale.domain(s.map(brushXScale.invert, brushXScale));
      mainChart.updateData();
      mainChartAxes.repaint('X');
      mainChartZoom.element.call(
        mainChartZoom.zoomBehavior.transform,
        d3.zoomIdentity.scale(820 / (s[1] - s[0])).translate(-s[0], 0)
      );
    });
  };
};
