#!/usr/bin/env node
var shjs = require("shelljs");
var inquirer = require('inquirer');

var checkDependency = function(executable) {
  if (!shjs.which(executable)) {
    echo('Error: ' + executable + ' is required to run the code analysis');
    shjs.exit(1);
  }
};

var runCommand = function(cmd) {
  shjs.exec(cmd);
  if (shjs.error()) {
    shjs.exit(1);
  }
};

var languageSetup = {
  javascript: function() {},
  ruby: function() {
    checkDependency('ruby');
    shjs.echo('Installing ruby dependencies...');
    runCommand('gem install flog');
  }
};

var prompt = inquirer.createPromptModule();

prompt({
  name: 'languages',
  message: 'Languages to analyse:',
  type: 'checkbox',
  choices: ['ruby'],
  default: []
}).then(function(answers) {
  answers.languages.forEach(function(lang) {
    languageSetup[lang].call();
  })
});
