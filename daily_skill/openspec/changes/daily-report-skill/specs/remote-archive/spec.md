## ADDED Requirements

### Requirement: Optional upload to Gitee repository
The system SHALL offer to upload the generated report to a private Gitee repository as an optional step.

#### Scenario: Upload prompt after report generation
- **WHEN** daily or weekly report generation is complete
- **THEN** system asks "是否上传至 Gitee 仓库归档？(y/N)" with default "N"

#### Scenario: User declines upload
- **WHEN** user answers "N" or presses Enter
- **THEN** system skips upload and completes the flow

#### Scenario: User accepts upload
- **WHEN** user answers "y"
- **THEN** system proceeds with the upload flow

### Requirement: Clone or update local repository
The system SHALL maintain a local clone of the Gitee repository for uploading reports.

#### Scenario: First time upload
- **WHEN** the local clone of the Gitee repository does not exist
- **THEN** system clones the configured remote repository URL to a local cache directory (e.g., `.claude/skills/daily-report/.cache/daily-report-repo`)

#### Scenario: Subsequent upload
- **WHEN** the local clone already exists
- **THEN** system performs `git pull` to sync with remote before uploading

### Requirement: Save report to repository
The system SHALL save the report file into the local clone with proper naming.

#### Scenario: Daily report file naming
- **WHEN** uploading a daily report
- **THEN** system saves the file as `daily/YYYY-MM-DD-工作日报.md` in the repository

#### Scenario: Weekly report file naming
- **WHEN** uploading a weekly report
- **THEN** system saves the file as `weekly/YYYY-WXX-工作周报.md` in the repository

### Requirement: Commit and push
The system SHALL commit the report file and push to the remote repository.

#### Scenario: Successful upload
- **WHEN** report file is saved to the local clone
- **THEN** system executes `git add`, `git commit -m "add: YYYY-MM-DD 工作日报"`, and `git push`

#### Scenario: Push failure
- **WHEN** git push fails (e.g., network error, auth failure)
- **THEN** system informs the user of the error and suggests checking git credentials and network connectivity

### Requirement: Repository URL as configurable variable
The system SHALL allow the Gitee repository URL to be configured as a variable.

#### Scenario: Default repository URL
- **WHEN** user does not specify a repository URL
- **THEN** system asks interactively "归档仓库地址？" (no hardcoded default)

#### Scenario: Custom repository URL
- **WHEN** user provides a repository URL
- **THEN** system uses the provided URL for cloning and pushing
