var d3 = require('d3'),
    _  = require('lodash');

var D3Element = require('../../d3_chart_components/d3_element.js');

module.exports = function() {
  this.bindTo = function(charts, model) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var brushPanelChart = _.find(charts, { 'name': 'brushPanel' });

    var diagramXScale = mainChart.axis.getAxisBehavior('X').scale();
    var brushXScale = brushPanelChart.axis.getAxisBehavior('X').scale();

    mainChart.zoom.zoomBehavior.on('zoom', function() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
      var t = d3.event.transform;
      diagramXScale.domain(t.rescaleX(brushXScale).domain());
      mainChart.updateData();
      mainChart.axis.repaint('X');
      brushPanelChart.brush.setActiveSelection(diagramXScale.range().map(t.invertX, t));
    });
    brushPanelChart.brush.brushBehavior.on('brush end', function() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
      var s = d3.event.selection || model.scale.x2.range();
      diagramXScale.domain(s.map(brushXScale.invert, brushXScale));
      mainChart.updateData();
      mainChart.axis.repaint('X');
      mainChart.zoom.element.call(
        mainChart.zoom.zoomBehavior.transform,
        d3.zoomIdentity.scale(820 / (s[1] - s[0])).translate(-s[0], 0)
      );
    });
  };
};
