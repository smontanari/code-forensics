code-forensics
--------------

**code-forensics** is a toolset for analysing codebases stored in a version control system. It leverages the repository logs, or version history data, to perform deep analyses with regards to complexity, logical coupling, authors coupling and to inspect the evolution in time of different parts of a software system with respect to metrics like code churn and number of revisions.

## Credits
This project is based on the excellent work of **Adam Tornhill** and his command line tool [Code Maat](https://github.com/adamtornhill/code-maat). The majority of the analysis that **code-forensics** performs are actually described in Adam's book [Your Code as a Crime Scene](https://pragprog.com/book/atcrime/your-code-as-a-crime-scene).

## Pre-requisites
* **Node.js** - code-forensics should run with most versions of node, however I haven't tested it with any version earlier than 4.
* **npm v3** - code-forensics requires a flat install of its dependencies into the node_modules folder in order to visualise d3 diagrams.
* **java 8** - Required in order to run code-maat. See the [Code Maat](https://github.com/adamtornhill/code-maat) repository for more details.
* **git** - Required to run some of the gulp tasks.

## Install
**code-forensics** is distributed as an nodejs module that runs on top of [gulp](https://github.com/gulpjs/gulp). It can be installed through npm:

`$ npm install code-forensics`

**Note**: I strongly recommend against installing **code-forensics** as a global module, as it requires certain packages to be at the top level of the node_modules folder in order to correctly run its internal http server and serve the pages to the browser for the visualisation part of the analysis. If **code-forensics** is installed as a global module such packages may conflict with already existing ones and that could cause all sorts of unpredictable issues.

## VCS support
At the moment **code-forensics** can work with **git** and **svn** based repositories, however other version control systems could be supported in the future, given the ability of Code Maat to parse log data from the most popular ones.

## Programming languages
Most of **code-forensics** analyses are agnostic of the programming language used in the repository, however some tasks can report metrics on the language complexity and currently only *Ruby* and *JavaScript* are supported. Complexity analysis for other languages can be added, possibly with your help.

## Compatibility
This software is not meant to be a commercial tool, hence support for various operating systems and different browsers is not a priority. I've tested **code-forensics** on a Mac OS X with different versions of Node.js, and primarily with Chrome as a browser. While I expect (and I'm willing to support) **code-forensics** to work in linux/unix environments, I can't guarantee it would on a Windows OS.

## Usage
This is only a short description on how to get started with **code-forensics**.

PLEASE REFER TO THE [WIKI PAGES](https://github.com/smontanari/code-forensics/wiki) FOR A MORE COMPREHENSIVE DOCUMENTATION.

Before posting a new issue please make sure you check out the **[Troubleshooting guide](https://github.com/smontanari/code-forensics/wiki/Troubleshooting)** and the **[Frequently Asked Questions](https://github.com/smontanari/code-forensics/wiki/Faq)** wiki pages.

### Minimal configuration
**code-forensics** runs as a set of gulp tasks, therefore it requires a `gulpfile.js` to bootstrap gulp, however there is no need to know the task declaration syntax, as all the necessary tasks are defined inside **code-forensics**.
The `gulpfile.js` must define the configuration options and parameters necessary to run **code-forensics** tasks.

A minimal configuration `gulpfile.js` would look like the following:
```javascript
require('code-forensics').configure(
  {
    repository: {
      rootPath: "<path-to-the-repo>",
    }
  }
);
```
The only required configuration value is the file system path to the root directory of the version control repository to analyse, however this example is not practical and I would recommend you learn about and configure other parameters to more effectively target the analyses you intend to run.

### Running analyses
Analyses are executed as a gulp task. Depending on how the gulp module is installed (as global or local) there are different ways to invoke the gulp command. Here, to simplify the examples, I will assume it is available on your command PATH.

Each analysis may require or accept optional parameters.
```
$ gulp <analysis-task-name> [parameters]
```
See [below](#task-usage-information) how to learn about any available task parameter.

**Note: it is highly recommended to specify a time interval for any analysis**. If not, **code-forensics** will attempt to analyse the git commits for the current date only, most likely resulting in empty or near empty reports. You can specify a time interval via command line parameters or through the configuration file. Please refer to the [provided documentation](https://github.com/smontanari/code-forensics/wiki).

#### List analysis tasks
To print the list of all the top level analysis tasks:
```
$ gulp list-analysis-tasks
```
Currently the following analyses are implemented:
* **javascript-complexity-trend-analysis** (when JavaScript is enabled)
* **ruby-complexity-trend-analysis** (when Ruby is enabled)
* **sloc-trend-analysis**
* **hotspot-analysis**
* **sum-of-coupling-analysis**
* **temporal-coupling-analysis**
* **system-evolution-analysis**
* **developer-effort-analysis**
* **developer-coupling-analysis**
* **knowledge-map-analysis**
* **commit-message-analysis**

#### List all available tasks
All available tasks can be printed, along with their description, by executing the following command:
```
$ gulp help
```

Alternatively it's always possible to print all the tasks names with or without their dependencies using gulp cli options, e.g. `gulp -T` or `gulp --tasks-simple`.

#### Task usage information
In order to learn which parameters can be passed to a task you can type the following command:
```
$ gulp help --taskName=<task-name>
```

##### Temporal period of analysis
For most tasks it's possible to specify a time period for which the analysis is performed by passing the parameters _dateFrom_ and _dateTo_. This is particularly useful to understand the evolution of the code in time and analyse negative or positive trends of particular metrics (see the [wiki pages](https://github.com/smontanari/code-forensics/wiki) for more detailed documentation).

### Visualise the reports
The results of each analysis can be displayed in the form of D3 diagrams.

Start up the local http server:
```bash
$ gulp webserver
```

Open the browser at `http://localhost:3000/index.html` to see a list of the available reports.

### Example: perform a commit message analysis
Say we want to investigate the commit messages in our repository during the first six months of 2016. The commit-message-analysis task produces a report on the most frequently used words in the commit messages:
```bash
$ gulp commit-message-analysis --dateFrom=2016-01-01 --dateTo=2016-06-30
```

The output of the command would be something similar to this:
```console
[00:13:07] Starting 'vcs-commit-messages'...
[00:13:07] Fetching git messages from 2010-01-01 to 2010-06-30
[00:13:07] Created: vcs_commit_messages_2010-01-01_2010-06-30.log
[00:13:07] Finished 'vcs-commit-messages' after 214 ms
[00:13:07] Starting 'commit-message-analysis'...
[00:13:07] Generating report file 2010-01-01_2010-06-30_commit-words-data.json
[00:13:07] Open the following link to see the results:
[00:13:07] http://localhost:3000/index.html?reportId=cbd5e3db4ecc7acfb000014f22107ac37e98d785
[00:13:07] Finished 'commit-message-analysis' after 62 ms
```

The results can then be displayed in a word cloud diagram at the url given above.

### Sample diagrams gallery
<table>
  <tbody>
    <tr>
      <td>Hotspot</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/hotspot1.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/hotspot1-th.jpg"></a></td>
      <td>Complexity trend</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/cx-trend2.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/cx-trend2-th.jpg"></a></td>
    </tr>
    <tr>
      <td>System evolution</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/sea2.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/sea2-th.jpg"></a></td>
      <td>Commit messages</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/cma1.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/cma1-th.jpg"></a></td>
    </tr>
    <tr>
      <td>Developer coupling</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/dc2.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/dc2-th.jpg"></a></td>
      <td>Developer network</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/dc5.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/dc5-th.jpg"></a></td>
    </tr>
    <tr>
      <td>Developer effort</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/de2.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/de2-th.jpg"></a></td>
      <td>Knowledge map</td><td><a href="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/km2.jpg"><img src="https://raw.githubusercontent.com/wiki/smontanari/code-forensics/images/km2-th.jpg"></a></td>
    </tr>
  </tbody>
</table>

## License
Copyright &copy; 2016-2017 Silvio Montanari

**code-forensics** is free software; you can redistribute it and/or modify it under the terms of the [GNU General Public License v3.0 or any later version](http://www.gnu.org/licenses/gpl.html).

### Acknowledgements
**code-forensics** makes use of [Code Maat](https://github.com/adamtornhill/code-maat) - Copyright &copy; Adam Tornhill
