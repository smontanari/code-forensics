# Changelog

### [Unreleased]

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
