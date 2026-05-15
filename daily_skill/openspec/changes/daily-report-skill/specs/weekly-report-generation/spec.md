## ADDED Requirements

### Requirement: Read daily reports from configured directory
The system SHALL read daily report files from a user-configured directory path.

#### Scenario: Directory configured
- **WHEN** user provides a daily report storage directory path
- **THEN** system scans the directory for daily report Markdown files matching the pattern `YYYY-MM-DD*.md`

#### Scenario: Directory not configured
- **WHEN** user triggers weekly report generation without a configured directory
- **THEN** system asks interactively "日报存放目录？"

#### Scenario: No daily reports found
- **WHEN** the configured directory contains no daily report files for the target week
- **THEN** system informs the user and asks to verify the directory path

### Requirement: Filter reports by target week
The system SHALL filter daily reports to include only those from the target week (Monday to Sunday).

#### Scenario: Default target week
- **WHEN** user does not specify a week
- **THEN** system defaults to the current week (Monday of current week to today)

#### Scenario: Specific week specified
- **WHEN** user specifies a date within a target week
- **THEN** system includes all daily reports from Monday to Sunday of that week

#### Scenario: Partial week
- **WHEN** only some days of the week have daily reports (e.g., Monday-Wednesday)
- **THEN** system generates the report based on available days and notes which days are missing

### Requirement: Aggregate storylines across days
The system SHALL merge storylines from multiple daily reports that relate to the same business feature.

#### Scenario: Same storyline across multiple days
- **WHEN** multiple daily reports contain storylines about the same feature (e.g., "分润结算" appears on Monday, Wednesday, Friday)
- **THEN** system merges them into one weekly storyline that summarizes the week's progress on that feature

#### Scenario: Unique storylines
- **WHEN** a storyline appears in only one daily report
- **THEN** system includes it as-is in the weekly report

### Requirement: Generate weekly summary structure
The system SHALL generate a weekly report with an overview section and detailed storylines.

#### Scenario: Weekly report structure
- **WHEN** generating the weekly report
- **THEN** output includes: (1) week date range header, (2) overview paragraph summarizing the week's key achievements, (3) detailed storylines with progress across the week, (4) next week plan section

### Requirement: Interactive weekly completion
The system SHALL ask supplementary questions specific to weekly reporting.

#### Scenario: Overall progress prompt
- **WHEN** draft weekly report is displayed
- **THEN** system asks "本周整体进展如何？有什么需要特别说明的？(回车跳过)"

#### Scenario: Next week plan prompt
- **WHEN** overall progress is collected
- **THEN** system asks "下周计划做什么？(回车跳过)"

#### Scenario: Risk and blocker prompt
- **WHEN** next week plan is collected
- **THEN** system asks "本周有风险或阻塞项需要说明吗？(回车跳过)"

### Requirement: Weekly report output format
The system SHALL output the weekly report in Markdown format suitable for leadership review.

#### Scenario: Markdown structure
- **WHEN** generating the final weekly report
- **THEN** output uses `#` for week range header, overview paragraph, `##` for storyline titles, numbered lists for points, and includes a `## 下周计划` section
