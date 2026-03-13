/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash'),
  Parser = require('tree-sitter'),
  Java = require('tree-sitter-java'),
  StringDecoder = require('string_decoder').StringDecoder,
  logger = require('../../log'),
  utils = require('../../utils');

var decoder = new StringDecoder();

module.exports = function () {

  var DECISION_POINT_NODE_TYPES = [
    // branching
    'if_statement',
    'ternary_expression',
    // loops
    'for_statement',
    'enhanced_for_statement',
    'while_statement',
    'do_statement',
    // exceptions
    'catch_clause'
  ];

  var CALLABLE_NODE_TYPES = [
    'method_declaration',
    'constructor_declaration',
    'compact_constructor_declaration',
    'lambda_expression',
    'static_initializer',
    'instance_initializer'
  ];

  function isCallableNode(node) {
    return CALLABLE_NODE_TYPES.indexOf(node.type) !== -1;
  }

  function hasLogicalOperator(node) {
    for (var i = 0; i < node.childCount; i++) {
      var child = node.child(i);
      if (child && (child.type === '&&' || child.type === '||')) {
        return true;
      }
    }
    return false;
  }


  function parseTreeFromContent(content) {
    // Create a fresh parser per parse to avoid concurrency issues.
    var parser = new Parser();
    parser.setLanguage(Java);
    // tree-sitter JS bindings expect a string (or a function). Ensure a string.
    var input;
    if (typeof content === 'string') {
      input = content;
    } else if (Buffer.isBuffer(content)) {
      input = content.toString('utf8');
    } else {
      input = decoder.write(content);
    }

    // tree-sitter JS binding can fail with "Invalid argument" for larger strings.
    // Use function input for large sources to avoid size limits.
    var chunkSize = 4096;
    return parser.parse(function(index) {
      if (index >= input.length) return null;
      return input.slice(index, index + chunkSize);
    });
  }

  function cyclomaticComplexity(content) {
    var tree;
    try {
      tree = parseTreeFromContent(content);
    } catch (e) {
      logger.error('Java CC parse error: ' + e.message);
      throw e;
    }
    var complexity = 1;

    function visit(node) {
      try {
        if (DECISION_POINT_NODE_TYPES.indexOf(node.type) !== -1) {
          complexity++;
        } else if (node.type === 'switch_label') {
          // Each switch label (case/default) contributes a decision point.
          complexity++;
        } else if (node.type === 'binary_expression') {
          if (hasLogicalOperator(node)) {
            complexity++;
          }
        }

        for (var i = 0; i < node.namedChildCount; i++) {
          visit(node.namedChild(i));
        }
      } catch (e) {
        throw e;
      }
    }

    visit(tree.rootNode);
    return complexity;
  }

  function safeLine(node) {
    try {
      return (node.startPosition && typeof node.startPosition.row === 'number')
        ? (node.startPosition.row + 1)
        : null;
    } catch (e) {
      return null;
    }
  }

  function nodeHasText(node) {
    return node && typeof node.text === 'string' && node.text.length > 0;
  }

  function findFirstNamedDescendant(node, predicate) {
    if (!node) return null;
    if (predicate(node)) return node;
    for (var i = 0; i < node.namedChildCount; i++) {
      var found = findFirstNamedDescendant(node.namedChild(i), predicate);
      if (found) return found;
    }
    return null;
  }

  function findBodyNode(callableNode) {
    if (!callableNode) return null;
    for (var i = 0; i < callableNode.namedChildCount; i++) {
      var child = callableNode.namedChild(i);
      if (!child) continue;
      if (child.type === 'block' || child.type === 'constructor_body') {
        return child;
      }
    }
    return callableNode;
  }

  function computeCyclomaticComplexityForBody(bodyRoot) {
    var complexity = 1;

    function visit(node, isRoot) {
      if (!node) return;

      try {
        if (!isRoot && isCallableNode(node)) {
          return;
        }

        if (DECISION_POINT_NODE_TYPES.indexOf(node.type) !== -1) {
          complexity++;
        } else if (node.type === 'switch_label') {
          complexity++;
        } else if (node.type === 'binary_expression') {
          if (hasLogicalOperator(node)) {
            complexity++;
          }
        }

        for (var i = 0; i < node.namedChildCount; i++) {
          visit(node.namedChild(i), false);
        }
      } catch (e) {
        throw e;
      }
    }

    visit(bodyRoot, true);
    return complexity;
  }

  function extractCallableName(callableNode) {
    var line = safeLine(callableNode);

    var identifierNode = findFirstNamedDescendant(callableNode, function (n) {
      return n.type === 'identifier';
    });
    if (identifierNode && nodeHasText(identifierNode)) {
      return identifierNode.text;
    }

    if (callableNode.type === 'constructor_declaration' || callableNode.type === 'compact_constructor_declaration') {
      return 'constructor' + (line ? ('@' + line) : '');
    }
    if (callableNode.type === 'static_initializer') {
      return 'static_init' + (line ? ('@' + line) : '');
    }
    if (callableNode.type === 'instance_initializer') {
      return 'init' + (line ? ('@' + line) : '');
    }
    if (callableNode.type === 'lambda_expression') {
      return 'lambda' + (line ? ('@' + line) : '');
    }

    return callableNode.type + (line ? ('@' + line) : '');
  }

  function collectMethodComplexity(content) {
    var tree;
    try {
      tree = parseTreeFromContent(content);
    } catch (e) {
      logger.error('Java method CC parse error: ' + e.message);
      throw e;
    }
    var result = [];

    function visit(node) {
      if (!node) return;

      if (isCallableNode(node)) {
        var body = findBodyNode(node);
        var cc = computeCyclomaticComplexityForBody(body);
        result.push({
          name: extractCallableName(node),
          line: safeLine(node),
          complexity: cc
        });
        for (var i = 0; i < node.namedChildCount; i++) {
          visit(node.namedChild(i));
        }
        return;
      }

      for (var j = 0; j < node.namedChildCount; j++) {
        visit(node.namedChild(j));
      }
    }

    visit(tree.rootNode);
    return result;
  }

  var analyse = function (filepath, content, transformFn, onError) {
    try {
      var cc = cyclomaticComplexity(content);
      var methodComplexity = collectMethodComplexity(content);

      var complexityReport = {
        path: filepath,
        totalComplexity: cc,
        averageComplexity: cc,
        methodComplexity: methodComplexity
      };

      if (_.isFunction(transformFn)) {
        return transformFn(complexityReport);
      }
      return complexityReport;
    } catch (e) {
      var details = e && (e.stack || e.message || e.toString());
      logger.error('Java analyse failed for ' + filepath + ': ' + details);
      onError(e);
    }
  };

  this.sourceAnalysisStream = function (filepath, transformFn) {
    return utils.stream.reduceToObjectStream(function (content) {
      return analyse(filepath, content, transformFn, function (e) {
        logger.error('Error analysing content: ' + e.message);
      });
    });
  };

  this.fileAnalysisStream = function (filepath, transformFn) {
    logger.info('Analysing ', filepath);
    return utils.stream.readFileToObjectStream(filepath, function (content) {
      return analyse(filepath, content, transformFn, function (e) {
        logger.error('Error analysing ' + filepath + ': ' + e.message);
      });
    });
  };
};
