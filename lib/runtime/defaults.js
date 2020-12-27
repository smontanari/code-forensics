/*
 * code-forensics
 * Copyright (C) 2016-2020 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = {
  parameters: {
    maxCoupledFiles: 5,
    minWordCount: 5
  },
  configuration: {
    tempDir: 'tmp',
    outputDir: 'output',
    dateFormat: 'YYYY-MM-DD',
    languages: []
  }
};
