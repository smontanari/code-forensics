# code-forensics
**code-forensics** is a toolset for analysing codebases stored in popular version control system. It leverages the repository logs, or version history data, to perform deep analysis with regards to complexity, software coupling, authors coupling and to inspect the evolution in time of some various metrics like code churn and number of revisions of different parts of a software system, degree of ownership and dependencies between developers and/or teams of developers.

## Credits
This project is based on the excellent work of **Adam Tornhill** and its command line tool [Code Maat](https://github.com/adamtornhill/code-maat). The majority of the analysis that **code-forensics** performs are actually described in Adam's book [Your Code as a Crime Scene](https://pragprog.com/book/atcrime/your-code-as-a-crime-scene).

## Pre-requisites
* **Node.js** - code-forensics should run with most versions of node, however I haven't tested it with any version earlier than 4.
* **npm v3** - code-forensics requires a flat install of its dependencies into the node_modules folder in order to visualise d3 diagrams.
* **java 8** - Required in order to run code-maat. See the [Code Maat](https://github.com/adamtornhill/code-maat) repository for more details.

## Install
**code-forensics** is distributed as an nodejs module that runs on top of [gulp](https://github.com/gulpjs/gulp). It can be installed through npm:

`$ npm install code-forensics`

**Note**: I strongly recommend against installing code-forensics as a global module, as it requires certain packages to be at the top level of the node_modules folder in order to correctly run its internal http server and serve the pages to the browser for the visualisation part of the analysis. If code-forensics is installed as a global module such packages may conflict with already existing ones and that could cause all sorts of unpredictable issues.

## Usage
This is a short description on how to get started with **code-forensics**.
**Please refer to the [WIKI PAGES](https://github.com/smontanari/code-forensics/wiki) for a comprehensive documentation, advanced settings and more**.

### Minimal configuration
code-forensics runs as a set of gulp tasks, therefore it requires a `gulpfile.js` to bootstrap gulp, however there is no need to know the task declaration syntax, as all the necessary tasks are defined inside code-forensics.
The `gulpfile.js` must define the configuration options and parameters necessary to run code-forensics tasks.

A minimal configuration javascript file would look like the following:
```javascript
require('code-forensics').configure(
  {
    repository: {
      rootPath: "<path-to-the-repo>",
    }
  }
);
```
The only necessary configuration value is the file system path to the root directory of the version control repository to analyse.

### Execute the analysis
Depending on how the gulp module is installed (as global or local) there are different ways to execute the gulp command. Here, to simplify the examples, I will assume it is available on your command PATH.

#### List all available tasks
All available tasks can be printed, along with their description, by executing the following command:
```
$ gulp help
```

Alternatively it's always possible to print all the tasks names with or without their dependencies using gulp cli options, e.g. `gulp -T` or `gulp --tasks-simple`.

#### Analysis tasks
To print the list of all the top level analysis tasks:
```
$ gulp list-analysis-tasks
```

Currently the following analysis are implemented:
* **javascript-complexity-trend-analysis** (when javascript is enabled)
* **ruby-complexity-trend-analysis** (when ruby is enabled)
* **sloc-trend-analysis**
* **hotspot-analysis**
* **sum-of-coupling-analysis**
* **temporal-coupling-analysis**
* **system-evolution-analysis**
* **developer-effort-analysis**
* **developer-coupling-analysis**
* **knowledge-map-analysis**
* **commit-message-analysis**

#### Task parameters
Each task may require additional or optional parameters in order to produce a particular output. To learn which parameters can be passed to a task type the following command:
```
$ gulp help --taskName <task-name>
```

##### Time period of analysis
For most tasks it's possible to specify a time period for which the analysis is performed by passing the parameters *dateFrom* and *dateTo*. This is particularly useful to understand the evolution of the code in time and analyse negative or positive trends of particular metrics.

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
$ gulp commit-message-analysis --dateFrom 2016-01-01 --dateTo 2016-06-30
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

The analysis results can then be displayed in a word cloud diagram at the url given above.

## Compatibility
This software is not meant to be a commercial tool, and I haven't run it in operating systems other than Mac OSX. Similarly the web pages and the diagrams may not display perfectly in every browser as I mostly perform my tests on Chrome.

## License
Copyright &copy; 2016 Silvio Montanari.

Distributed under the [GNU General Public License v3.0](http://www.gnu.org/licenses/gpl.html).
