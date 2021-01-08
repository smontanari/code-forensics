/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var GraphDataHelper     = require('./graph_data_helper'),
    RevisionHelper      = require('./revision_helper'),
    FilesHelper         = require('./files_helper'),
    CodeMaatHelper      = require('./code_maat_helper'),
    DeveloperDataHelper = require('./developer_data_helper');

module.exports = function(context) {
  return {
    graphData:     new GraphDataHelper(context),
    revision:      new RevisionHelper(context),
    developerData: new DeveloperDataHelper(context),
    files:         new FilesHelper(context),
    codeMaat:      new CodeMaatHelper(context)
  };
};
