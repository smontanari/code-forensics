/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    XmlReader     = require('xml-reader'),
    xml           = require('xml'),
    StringDecoder = require('string_decoder').StringDecoder;

var LogEntryScanner = function(nodeChildrenTransform) {
  var scanNode = function(node) {
    var nodeChildren = _.compact(_.map(node.children, function(childNode) {
      if (childNode.type === 'text') { return childNode.value; }

      return scanNode(childNode);
    }));

    var childElements = nodeChildrenTransform(node.name, nodeChildren);
    if (childElements) {
      return _.tap({}, function(element) {
        element[node.name] = [{ _attr: node.attributes }].concat(childElements);
      });
    }
  };

  this.scan = function(node) {
    return scanNode(node);
  };
};

module.exports = function(repository, developersInfo, adapter) {
  var decoder = new StringDecoder();

  var relativeFilePathRegExp = new RegExp(adapter.vcsRelativePath().trim() + '/?(.*)$');
  var normaliseFilePath = function(path) {
    var match = path.match(relativeFilePathRegExp);
    if (match) { return match[1]; }
  };

  var transformNodeChildren = function(nodeName, nodeChildren, pathEvalCallback) {
    switch(nodeName) {
      case 'author':
        return [developersInfo.find(nodeChildren[0]).name];
      case 'path':
        var path = normaliseFilePath(nodeChildren[0]);
        var validPath = repository.isValidPath(path);
        if (_.isFunction(pathEvalCallback)) { pathEvalCallback(validPath); }
        if (validPath) {
          return [path];
        } else {
          return null;
        }
      default:
        return nodeChildren;
    }
  };

  this.normaliseLogStream = function(inputStream, pathEvalCallback) {
    var logEntryScanner = new LogEntryScanner(_.partialRight(transformNodeChildren, pathEvalCallback));
    var rootElement = xml.element();
    var outputStream = xml({ log: rootElement }, { declaration: true });
    var reader = XmlReader.create({ stream: true });

    reader.on('tag:logentry', function(node) {
      var logentryElement = logEntryScanner.scan(node);
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
