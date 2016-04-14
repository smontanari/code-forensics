#!/usr/bin/env node
var shjs = require("shelljs"),
    chalk = require('chalk'),
    inquirer = require('inquirer');

var logErrorAndExit = function(message) {
  echo(chalk.red("Missing library/package/command:\n" + message));
  shjs.exit(1);
};

var checkExecutableDependency = function(executable, errorMessage) {
  if (!shjs.which(executable)) {
    logErrorAndExit(errorMessage);
  }
};

var checkPackageDependency = function(findPackageCmd, errorMessage) {
  if (!shjs.exec(findPackageCmd)) {
    logErrorAndExit(errorMessage);
  }
};

var languageDependencyCheck = {
  ruby: function() {
    checkExecutableDependency('ruby', 'Please install the ruby interpreter');
    checkPackageDependency('gem list flog -l -i', 'Please install the gem "flog".')
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
    languageDependencyCheck[lang].call();
  })
});
