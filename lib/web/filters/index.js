/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  RegExpValue:           require('./regexp.js'),
  MetricRange:           require('./metric_range.js'),
  PercentageMetricRange: require('./percentage_metric_range.js'),
  ColorRange:            require('./color_range.js'),
  GroupListSelection:    require('./group_list_selection.js')
};
