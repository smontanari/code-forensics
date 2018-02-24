/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    XmlReader     = require('xml-reader'),
    xml           = require('xml'),
    StringDecoder = require('string_decoder').StringDecoder;

module.exports = function(repository, developersInfo, adapter) {
  var decoder = new StringDecoder();

  var relativeFilePathRegExp = new RegExp(adapter.vcsRelativePath().trim() + '/?(.*)$');
  var normaliseFilePath = function(path) {
    var match = path.match(relativeFilePathRegExp);
    if (match) { return match[1]; }
  };

  var transformXmlNode = function(node) {
    var nodeChildren = _.compact(_.map(node.children, function(childNode) {
      if (childNode.type === 'text') { return childNode.value; }

      return transformXmlNode(childNode);
    }));

    var childElements = nodeChildren;
    switch(node.name) {
      case 'author':
        childElements = [developersInfo.find(nodeChildren[0]).name];
        break;
      case 'path':
        var path = normaliseFilePath(nodeChildren[0]);
        if (repository.isValidPath(path)) {
          childElements = [path];
        } else {
          return null;
        }
        break;
      case 'paths':
        if (_.isEmpty(nodeChildren)) { return null; }
        break;
      case 'logentry':
        if (_.isUndefined(_.find(nodeChildren, 'paths'))) { return null; }
        break;
      default:
    }
    var element = {};
    element[node.name] = [{ _attr: node.attributes }].concat(childElements);
    return element;
  };

  this.normaliseLogStream = function(inputStream) {
    var rootElement = xml.element();
    var outputStream = xml({ log: rootElement }, { declaration: true });
    var reader = XmlReader.create({ stream: true });

    reader.on('tag:logentry', function(node) {
      var logentryElement = transformXmlNode(node);
      if (logentryElement !== null) {
        rootElement.push(logentryElement);
      }
    });
    inputStream
      .on('data', function(chunk) { reader.parse(decoder.write(chunk)); })
      .on('end', function() { rootElement.close(); });

    return outputStream;
  };
};
