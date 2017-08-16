/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var Model         = require('../diagrams/enclosure_chart/weighted_diagram_model.js'),
    ZoomHandler   = require('../diagrams/enclosure_chart/zoom_handler.js'),
    LayoutAdapter = require('../diagrams/enclosure_chart/pack_layout_adapter.js');

module.exports = function(manifest) {
  var modulePath = manifest.parameters.targetFile;

  return {
    metadata: {
      title: 'Temporal Coupling analysis',
      description: 'file: ' + modulePath,
      diagramSelectionTitle: 'Time period',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs(
      _.map(manifest.dataFiles, function(data) {
        var dates = data.timePeriod.split('_');
        return {
          id: 'tc-' + data.timePeriod,
          diagramName: 'temporal-coupling',
          label: 'from ' + dates[0] + ' to ' + dates[1],
          dataFile: data,
          viewTemplates: ['elementInfo3TooltipTemplate'],
          diagram: {
            Model: Model,
            layoutAdapter: new LayoutAdapter({ diameter: 950, valueProperty: 'totalLines' }),
            graphHandlers: [new ZoomHandler({ diameter: 950 })],
            configuration: {
              style: {
                cssClass: 'circle-packing-diagram temporal-coupling',
                width: 960,
                height: 960,
                diameter: 950,
                nodeDepthColorRange: ['hsl(185,60%,99%)', 'hsl(187,40%,70%)'],
                weightedNodeColor: '#990012',
                nodeHighlight: { name: modulePath, color: '#1269FC' }
              },
              series: { calculatedWeightProperty: 'weight', valueProperty: 'totalLines' },
              tooltipInfo: {
                templateId: 'element-info-3-tooltip',
                templateProperties: [
                  { label: 'Coupling degree', valueProperty: 'couplingDegree' },
                  { label: 'Average revisions', valueProperty: 'revisionsAvg' },
                  { label: 'Added lines', valueProperty: 'addedLines' },
                  { label: 'Deleted lines', valueProperty: 'deletedLines' }
                ]
              },
            },
            dataTransform: function(nodesArray) {
              return _.filter(nodesArray, function(node) {
                return node.fullName() === modulePath || node.isRoot() || !node.isLeaf() || node.data.couplingDegree > 0;
              });
            }
          }
        };
      })
    )
  };
};
