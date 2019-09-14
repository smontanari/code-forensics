Improvements:
- don't execute code-maat and print error message if log dump is empty or without file metrics
- add option to clear logs before analysis run

Refactoring:
- suggest using Git `.mailmap` to reduce effort in configuring developers names
- define contributor group to capture any/every other dev
- refactor ReportController initialisation

Features:
code fragmentation
- per dev
- per team

code age (--deep option => median code age per file git blame)
- enclosure diagram
- age distribution istogram

restrict analysis to subset of files
- use existing layer groups?
