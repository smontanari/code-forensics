/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  DefinitionsArchive: require('./definitions_archive'),
  stream:             require('./stream'),
  json:               require('./json'),
  arrays:             require('./arrays'),
  require_ifexists:   require('./require_ifexists'),
  fileSystem:         require('./file_system'),
  pathMatchers:       require('./path_matchers'),
  platformCheck:      require('./platform_check'),
  SingletonFactory:   require('./singleton_factory'),
  XmlUtils:           require('./xml_utils')
};
