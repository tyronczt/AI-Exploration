## ADDED Requirements

### Requirement: Read weekly reports for target month
The system SHALL read weekly report files from the configured directory for the target month.

#### Scenario: Default target month
- **WHEN** user does not specify a month
- **THEN** system defaults to the current month

#### Scenario: Specific month specified
- **WHEN** user specifies a month (e.g., "2026-05")
- **THEN** system includes all weekly reports that overlap with that month

#### Scenario: Partial month
- **WHEN** only some weeks of the month have weekly reports (e.g., month is in progress)
- **THEN** system generates the report based on available weeks and notes the coverage period

#### Scenario: No weekly reports found
- **WHEN** the configured directory contains no weekly report files for the target month
- **THEN** system informs the user and asks to verify the directory path and month

### Requirement: Aggregate storylines across weeks
The system SHALL merge storylines from multiple weekly reports that relate to the same business feature.

#### Scenario: Same storyline across multiple weeks
- **WHEN** multiple weekly reports contain storylines about the same feature across different weeks of the month
- **THEN** system merges them into one monthly storyline that summarizes the month's progress on that feature

#### Scenario: Sub-feature evolution
- **WHEN** a storyline evolves over the month (e.g., "分润结算" progresses from design to development to testing across weeks)
- **THEN** system captures the progression arc in the monthly summary

### Requirement: Generate monthly summary structure
The system SHALL generate a monthly report with an overview section, detailed storylines, and a next month plan section.

#### Scenario: Monthly report structure
- **WHEN** generating the monthly report
- **THEN** output includes: (1) month header, (2) overview paragraph summarizing the month's key achievements, (3) detailed storylines with progress across the month, (4) next month plan section

### Requirement: Interactive monthly completion
The system SHALL ask supplementary questions specific to monthly reporting.

#### Scenario: Monthly highlights prompt
- **WHEN** draft monthly report is displayed
- **THEN** system asks "本月最重要的成果是什么？(回车跳过)"

#### Scenario: Next month plan prompt
- **WHEN** monthly highlights are collected
- **THEN** system asks "下月计划做什么？(回车跳过)"

#### Scenario: Risk and blocker prompt
- **WHEN** next month plan is collected
- **THEN** system asks "本月有风险或阻塞项需要说明吗？(回车跳过)"

### Requirement: Monthly report output format
The system SHALL output the monthly report in Markdown format suitable for leadership review.

#### Scenario: Markdown structure
- **WHEN** generating the final monthly report
- **THEN** output uses `#` for month header, overview paragraph, `##` for storyline titles, numbered lists for points, and includes a `## 下月计划` section
