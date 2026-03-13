/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash'),
  Parser = require('tree-sitter'),
  Kotlin = require('tree-sitter-kotlin'),
  StringDecoder = require('string_decoder').StringDecoder,
  logger = require('../../log'),
  utils = require('../../utils');

var decoder = new StringDecoder();

module.exports = function () {
  var parser = new Parser();
  parser.setLanguage(Kotlin);

  // NOTE:
  // We intentionally keep the overall (file-level) cyclomatic complexity logic
  // and add method-level metrics in a backwards compatible way.

  // --- Method-level cyclomatic complexity ---
  // We compute CC for each "callable" block (function/method/ctor/init/getter/setter/lambda).
  // When computing complexity for a callable body we do not descend into nested callables
  // (otherwise outer functions would inherit inner lambda complexity).

  var DECISION_POINT_NODE_TYPES = [
    // branching
    "if_expression",
    "when_expression",
    // loops
    "for_statement",
    "while_statement",
    "do_while_statement",
    // exceptions
    "catch_block",
    // expressions commonly treated as decision points
    "elvis_expression",
    "conjunction_expression", // &&
    "disjunction_expression"  // ||
  ];

  function parseTreeFromCode(code) {
    var input = (typeof code === 'string') ? code : decoder.write(code);
    var chunkSize = 4096;
    return parser.parse(function(index) {
      if (index >= input.length) return null;
      return input.slice(index, index + chunkSize);
    });
  }

  var cyclomaticComplexity = function (code) {
    var tree = parseTreeFromCode(code);
    var complexity = 1;

    function visit(node) {
      var type = node.type;
      // Decision points for Kotlin
      if (DECISION_POINT_NODE_TYPES.indexOf(type) !== -1) {
        complexity++;
      }

      for (var i = 0; i < node.namedChildCount; i++) {
        visit(node.namedChild(i));
      }
    }

    visit(tree.rootNode);
    return complexity;
  };

  // Callable nodes we want to report separately.
  // The exact node names depend on tree-sitter-kotlin version; we keep this list permissive.
  var CALLABLE_NODE_TYPES = [
    "function_declaration",
    "named_function",
    "function_definition",
    "secondary_constructor",
    "constructor_declaration",
    "init_block",
    "getter",
    "setter",
    "lambda_literal",
    "lambda_expression"
  ];

  function isCallableNode(node) {
    return CALLABLE_NODE_TYPES.indexOf(node.type) !== -1;
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
    // Prefer an explicit function body / block.
    // For expression bodies, we just take the callable node itself as a traversal root.
    for (var i = 0; i < callableNode.namedChildCount; i++) {
      var child = callableNode.namedChild(i);
      if (!child) continue;
      if (child.type === "function_body" || child.type === "block" || child.type === "body") {
        return child;
      }
    }
    return callableNode;
  }

  function computeCyclomaticComplexityForBody(bodyRoot) {
    var complexity = 1;

    function visit(node, isRoot) {
      if (!node) return;

      // Do not include nested callables in parent method complexity.
      if (!isRoot && isCallableNode(node)) {
        return;
      }

      if (DECISION_POINT_NODE_TYPES.indexOf(node.type) !== -1) {
        complexity++;
      }

      // when: some tools also count each branch; keep the old file-level behavior (+1 per when_expression)
      // for consistency and simplicity here.

      for (var i = 0; i < node.namedChildCount; i++) {
        visit(node.namedChild(i), false);
      }
    }

    visit(bodyRoot, true);
    return complexity;
  }

  function safeLine(node) {
    try {
      // Tree-sitter: row is 0-based.
      return (node.startPosition && typeof node.startPosition.row === 'number')
        ? (node.startPosition.row + 1)
        : null;
    } catch (e) {
      return null;
    }
  }

  function extractCallableName(callableNode) {
    // Best effort naming. If we cannot extract a stable name, fall back to type@line.
    var line = safeLine(callableNode);

    // Kotlin functions generally contain an identifier child.
    var identifierNode = findFirstNamedDescendant(callableNode, function (n) {
      return n.type === "simple_identifier" || n.type === "identifier";
    });
    if (identifierNode && nodeHasText(identifierNode)) {
      return identifierNode.text;
    }

    // init blocks / ctors / accessors / lambdas
    if (callableNode.type === "init_block") {
      return "init" + (line ? ("@" + line) : "");
    }
    if (callableNode.type === "secondary_constructor" || callableNode.type === "constructor_declaration") {
      return "constructor" + (line ? ("@" + line) : "");
    }
    if (callableNode.type === "getter") {
      return "get" + (line ? ("@" + line) : "");
    }
    if (callableNode.type === "setter") {
      return "set" + (line ? ("@" + line) : "");
    }
    if (callableNode.type === "lambda_literal" || callableNode.type === "lambda_expression") {
      return "lambda" + (line ? ("@" + line) : "");
    }

    return callableNode.type + (line ? ("@" + line) : "");
  }

  function collectMethodComplexity(code) {
    var tree = parseTreeFromCode(code);
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
        // Still traverse nested callables so they are included in result.
        for (var i = 0; i < node.namedChildCount; i++) {
          visit(node.namedChild(i));
        }
        return;
      }

      for (var i = 0; i < node.namedChildCount; i++) {
        visit(node.namedChild(i));
      }
    }

    visit(tree.rootNode);
    return result;
  }

  var analyse = function (filepath, content, transformFn, onError) {
    try {
      var code = decoder.write(content);
      var cc = cyclomaticComplexity(code);
      var methodComplexity = collectMethodComplexity(code);

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
