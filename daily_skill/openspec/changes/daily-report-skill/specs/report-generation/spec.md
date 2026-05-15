## ADDED Requirements

### Requirement: Output Markdown format
The system SHALL output the final daily report in Markdown format.

#### Scenario: Markdown structure
- **WHEN** generating the final report
- **THEN** output uses `#` for date header, `##` for storyline titles, numbered lists for points, and inline markers for status

### Requirement: Include date in header
The system SHALL include the report date in the header.

#### Scenario: Date header
- **WHEN** report is generated
- **THEN** first line is `# YYYY-MM-DD 工作日报`

### Requirement: Status markers
The system SHALL annotate storyline points with completion status markers.

#### Scenario: Completed marker
- **WHEN** a point is marked as "已完成"
- **THEN** point text ends with ` *(已完成)*`

#### Scenario: In-progress marker
- **WHEN** a point is marked as "进行中"
- **THEN** point has no marker (default state)

#### Scenario: Pending marker
- **WHEN** a point is marked as "待开发"
- **THEN** point text ends with ` *(待开发)*`

### Requirement: Collaboration context inclusion
The system SHALL include user-provided collaboration context in the report.

#### Scenario: Collaboration as sub-point
- **WHEN** user provides collaboration details
- **THEN** system adds these as lettered sub-points (a., b., c.) under the relevant storyline or as a separate storyline

### Requirement: Copyable output
The system SHALL present the final report in a way that is easy to copy.

#### Scenario: Final output display
- **WHEN** report generation is complete
- **THEN** system displays the full report in a single code block or text block that can be copied in one action

### Requirement: Concise business-only point wording
The system SHALL keep each report point concise and business-facing.

#### Scenario: One sentence per point
- **WHEN** final daily report points are generated
- **THEN** each numbered point is written as one complete sentence without extra technical explanation, parenthetical file notes, or line-count details

#### Scenario: Code terms excluded
- **WHEN** final daily report text is assembled
- **THEN** it contains no file names, paths, component names, API names, variable names, method names, class names, commit hashes, diff wording, console/log references, or code cleanup wording

### Requirement: Daily report completion confirmation
The system SHALL ask the user to confirm the daily report is complete before saving or archiving it.

#### Scenario: User confirms daily report completion
- **WHEN** the final daily report is displayed
- **THEN** system asks "日报是否确认完成？(Y/n)" with default "Y"

#### Scenario: User requests changes before completion
- **WHEN** user answers "n"
- **THEN** system asks what should be adjusted, updates the daily report, displays it again, and repeats the completion confirmation
