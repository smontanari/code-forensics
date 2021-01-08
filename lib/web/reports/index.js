/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  'hotspot-analysis':   require('./hotspot_analysis.js'),
  'complexity-trend':   require('./complexity_trend.js'),
  'sloc-trend':         require('./sloc_trend.js'),
  'sum-of-coupling':    require('./sum_of_coupling.js'),
  'temporal-coupling':  require('./temporal_coupling.js'),
  'system-evolution':   require('./system_evolution.js'),
  'commit-messages':    require('./word_cloud.js'),
  'developer-effort':   require('./developer_effort.js'),
  'developer-coupling': require('./developer_coupling.js'),
  'knowledge-map':      require('./knowledge_map.js')
};
