## ADDED Requirements

### Requirement: Extract commits by author and date
The system SHALL extract git commit history from a specified repository, filtered by author email and date range.

#### Scenario: Single repo extraction
- **WHEN** user provides one repo path, author email, and date
- **THEN** system executes `git log --author=<email> --since=<date> --until=<date+1> --no-merges --pretty=format:"%h|%s|%ai" --stat` and returns all matching commits

#### Scenario: No commits found
- **WHEN** git log returns no commits for the given author and date
- **THEN** system informs the user that no commits were found and asks to verify the author email and date

### Requirement: Support multiple repositories
The system SHALL accept multiple repository paths and extract commits from each.

#### Scenario: Multiple repos provided
- **WHEN** user provides multiple comma-separated repo paths
- **THEN** system extracts commits from each repo and tags each commit with its source repo name

#### Scenario: Interactive repo addition
- **WHEN** user has not provided repo paths or wants to add more
- **THEN** system asks "仓库路径？" and allows comma-separated input or Enter to finish

### Requirement: Filter noise commits
The system SHALL automatically filter out commits that have no business value.

#### Scenario: Noise commit filtered
- **WHEN** a commit message contains keywords like "编译报错", "编译错误", "格式调整", "代码格式", "缩进", "merge"
- **THEN** that commit is excluded from the report

#### Scenario: All commits filtered
- **WHEN** all commits are filtered as noise
- **THEN** system informs the user that only noise commits were found and shows the filtered list for verification

### Requirement: Default variable values
The system SHALL provide sensible defaults for input variables.

#### Scenario: Default date
- **WHEN** user does not specify a date
- **THEN** system defaults to today's date

#### Scenario: Default author email
- **WHEN** user does not specify an author email
- **THEN** system asks interactively "提交者邮箱？"

#### Scenario: Default repo path
- **WHEN** user does not specify a repo path
- **THEN** system asks interactively "仓库路径？"
