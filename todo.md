Dependencies:
- more upgrades require higher versions of NodeJS. Assess upgrading to NodeJS >= 8.

Improvements:

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
