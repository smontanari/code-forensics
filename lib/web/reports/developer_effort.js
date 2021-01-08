/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var Model             = require('../diagrams/treemap/diagram_model.js'),
    LayoutAdapter     = require('../diagrams/treemap/treemap_layout_adapter.js'),
    ColorScaleFactory = require('../utils/color_scale_factory.js'),
    ZoomHandler       = require('../diagrams/treemap/zoom_handler.js'),
    widgets           = require('../widgets/index.js');

var nodeNames = function(series) {
  return _.sortBy(_.uniq(_.map(
    _.filter(series, function(node) { return !node.children; }),
    function(node) { return node.data.name; })
  ));
};

module.exports = function(manifest) {
  var diagramConfig = function() {
    return {
      Model: Model,
      layoutAdapter: new LayoutAdapter({ width: 1000, height: 650, valueProperty: 'revisions' }),
      graphHandlers: [new ZoomHandler()],
      configuration: {
        style: {
          cssClass: 'treemap-diagram',
          width: 1000,
          height: 650,
          margin: { top: 24, right: 0, bottom: 0, left: 0 }
        },
        colorScaleFactory: function(series) {
          return ColorScaleFactory.sequentialRainbow(nodeNames(series));
        },
        series: { valueProperty: 'revisions' }
      },
      controls: {
        widgets: {
          colorMap: {
            instance: new widgets.ColorMap(),
            group: 'colorMap',
            dataTransform: nodeNames
          }
        }
      }
    };
  };

  return {
    metadata: {
      title: 'Developer effort analysis',
      description: 'effort distribution (revisions) between programmers/teams',
      diagramSelectionTitle: 'Effort distribution',
      dateRange: manifest.parseDateRange()
    },
    graphModels: manifest.selectAvailableGraphs([
      {
        id: 'individual-effort',
        diagramName: 'individual-effort',
        label: 'By developer',
        dataFile: _.find(manifest.dataFiles, { fileType: 'individual-effort' }),
        controlTemplates: {
          widgets: [
            { name: 'colorMapWidgetTemplate', data: { labels: ['Developers'] } }
          ]
        },
        diagram: diagramConfig()
      },
      {
        id: 'team-effort',
        diagramName: 'team-effort',
        label: 'By team',
        dataFile: _.find(manifest.dataFiles, { fileType: 'team-effort' }),
        controlTemplates: {
          widgets: [
            { name: 'colorMapWidgetTemplate', data: { labels: ['Teams'] } }
          ]
        },
        diagram: diagramConfig()
      }
    ])
  };
};
