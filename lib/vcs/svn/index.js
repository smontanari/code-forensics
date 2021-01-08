/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  Adapter:              require('./svn_adapter'),
  LogStreamTransformer: require('./svnlog_stream_transformer')
};
