# Changelog

### [Unreleased]

### [2.4.0] - 2020-12-22
This is the last release to support Node versions `>=4.5`. Future releases will require a higher versions.
#### Added
- Dockerfile to build a codemaat image using the given jar package
#### Fixed
- Fixed bug when running codemaat off a docker image. The group file path option was not mapped to the configured data volume, causing a codemaat error
#### Changed
- Modified git log command option to respect the `.mailmap` file (issue #61)
- Upgraded package dependencies: ansi-colors, bluebird, csv-string, glob, http-server, JSONStream, lodash, merge2, mkdirp moment, router, shelljs, string_decoder

### [2.3.1] - 2019-11-04
#### Fixed
- Issue when analysing git log files with no commit churn data, causing churn report to fail metric calculation

### [2.3.0] - 2019-09-23
#### Added
- `clear-logs` task
- `updateLogs` parameter to vcs tasks to allow re-generating selected log files
- Raise error if the vcs log generates no relevant commit data (i.e. commit info and file pathnames)

### [2.2.1] - 2019-07-31
#### Fixed
- #42: logging CFValidationError fails with undefined logger

### [2.2.0] - 2019-06-11
#### Changed
- Support running `codemaat` via `docker`
- Updated `codemaat` package to version `1.0.1`
- Migrated tests from Jasmine to _Jest_
- Upgraded `escomplex` to `0.1.0`
- Upgraded package dependencies: JSONStream, bluebird, csv-string, d3, d3-tip,ecstatic, findup-sync, glob, less, lodash, merge2, moment, multipipe, multistream, mustache, router, shelljs, sloc, string_decoder, systemjs, eslint, eslint-plugin-jasmine, jasmine
- simplified styling of slider component
- Removed direct dependency on `fancy-log` to work around some log colour issues
- Replaced `chalk` with `ansi-colors`

### [2.1.1] - 2018-12-30
#### Fixed
- Reading property `serialProcessing` from configuration file.

### [2.1.0] - 2018-12-27
#### Changed
- Improved and simplified async and parallel processing logic. By default the program will use all the available cpu cores to run multiple commands in parallel. With the environment variable `SERIAL_PROCESSING` set, or with the configuration property `serialProcessing: true`, the program will switch to run one command at a time. See the [wiki](https://github.com/smontanari/code-forensics/wiki/Advanced-setup#parallel-vs-serial-execution) for more information. The previous way of configuring parallelism (using the `maxConcurrency` setting) is still maintained for backward compatibility, but it is _deprecated_.

### [2.0.1] - 2018-11-08
#### Fixed
- Removed/amended invalid lines in the System Evolution summary report (issue #37) when no revisions data is available for a certain time period.

### [2.0.0] - 2018-09-14
#### Added
- (Number of) authors trend to the _system-evolution-analysis_ task
- (Number of) commits trend to the _system-evolution-analysis_ task
#### Changed
- **BREAKING CHANGE**: the _system-evolution-analysis_ task now writes the (number of) revisions trend data into a new report file, i.e. "system-summary-data.json", which is derived from a code-maat "summary" analysis, together with commits and authors statistics. This change requires a new, non backward-compatible change to the graph initialisation logic. Older system evolution analysis reports will not be parsed correctly and will not render a "Revisions" diagram
- The _generate-layer-grouping-file_ task has been renamed to _generate-layer-grouping-files_ and now it generates individual layer group files as well as the original one. This is used to filter by layer the results of code-maat analysis that don't explictly provide file/entity paths data (e.g. "summary" analysis)

### [1.1.1] - 2018-09-11
#### Added
- enabling code-maat summary analysis. Not available yet as analysis task
#### Fixed
- correct date sorting in system evolution report
- better handling of graph initialization errors. Fixes #35

### [1.1.0] - 2018-06-29
#### Added
- system evolution diagram now shows cumulative loc metric in the churn section

### [1.0.1] - 2018-04-16
#### Changed
- package.json requires nodejs v4

### [1.0.0] - 2018-04-13
#### Added
- clipboard handler in hotspot analysis. Double-clicking on a leaf node in the diagram copies the file path to the user's clipboard.
- clipboard handler in trend analyses. Double-clicking on a dot in the diagram copies the revision hash to the user's clipboard.
#### Changed
- vcs log dumps now include references to no longer existing files as long as in a valid path. This will affect data/diagrams in the _System Evolution Analysis_, which now will take into account also revisions and lines of code related to files that had been later deleted. This should provide for more truthful reports over past time periods.
- upgraded gulp to version 4
- upgraded other dependencies, with dropped support for node 0.10 and 0.12
- removed flog gem version check
- renamed `dateRange` label to `time period`
- upgraded various dependencies

### [0.15.2] - 2018-02-26
#### Fixed
- #25, #22

### [0.15.1] - 2017-10-31
#### Changed
- discover node_modules path dynamically in webserver script
#### Fixed
- style/display issues in trend diagrams

### [0.15.0] - 2017-10-27
#### Changed
- bind http server to 0.0.0.0 rather than just the loopback interface
- diagram style improvements
- report table style changes

### [0.14.0] - 2017-09-01
#### Changed
- switched to typhonjs-escomplex for javascript complexity analysis

### [0.13.1] - 2017-09-01
#### Changed
- warn and remove unsupported language instead of failing

### [0.13.0] - 2017-02-12
#### Added
- support for SVN version control

### [0.12.1] - 2017-02-12
#### Fixed
- range input re-display

### [0.12.0] - 2017-01-11
#### Added
- support for regexp group layers

### [0.11.1] - 2017-01-04
#### Added
- link from diagram page to report list page

### [0.11.0] - 2016-12-26
#### Changed
- changed functionality of time period frequency

### [0.10.0] - 2016-12-26
#### Added
- sloc trend analysis
#### Changed
- renamed configuration parameters for team contributors, time split, and commit message filters

### [0.9.3] - 2016-12-15
#### Changed
- made gulp a direct dependency

### [0.9.2] - 2016-12-15
#### Changed
- updated install instructions

### [0.9.1] - 2016-12-15
Initial version
